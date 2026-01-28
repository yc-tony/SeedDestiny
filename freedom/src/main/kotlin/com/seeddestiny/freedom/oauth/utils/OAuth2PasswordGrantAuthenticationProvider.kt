package com.seeddestiny.freedom.oauth.utils

import com.seeddestiny.freedom.common.utils.logger
import com.seeddestiny.freedom.oauth.model.OAuth2PasswordGrantAuthenticationToken
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.OAuth2AccessToken
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2ErrorCodes
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator

/**
 * OAuth2 密碼模式驗證處理器
 * 負責驗證 Client 權限、校驗使用者帳號密碼，並核發 Access Token
 */
class OAuth2PasswordGrantAuthenticationProvider(
    private val authorizationService: OAuth2AuthorizationService,
    private val tokenGenerator: OAuth2TokenGenerator<*>,
    private val userDetailsService: UserDetailsService,
    private val passwordEncoder: PasswordEncoder
) : AuthenticationProvider {
    private val logger = logger()

    override fun authenticate(authentication: Authentication): Authentication {
        val passwordGrantAuth = authentication as OAuth2PasswordGrantAuthenticationToken

        // 1. 取得並驗證 Client (應用程式) 資訊
        // Client 驗證資訊存放在 SecurityContext 中，而非傳入的 authentication 參數
        val clientPrincipal = getAuthenticatedClientElseThrowInvalidClient()
        val registeredClient = clientPrincipal.registeredClient
            ?: throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_CLIENT))

        // 2. 檢查此 Client 是否支援密碼模式 (password grant type)
        if (!registeredClient.authorizationGrantTypes.contains(passwordGrantAuth.getGrantType())) {
            logger.error("Invalid grant type for client: ${clientPrincipal.principal}")
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT))
        }

        // 3. 根據 username 載入使用者資料
        val userDetails = try {
            userDetailsService.loadUserByUsername(passwordGrantAuth.username)
        } catch (e: Exception) {
            logger.error("Failed to load user: ${passwordGrantAuth.username}", e)
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_GRANT))
        }

        // 4. 比對使用者密碼是否正確
        if (!passwordEncoder.matches(passwordGrantAuth.password, userDetails.password)) {
            logger.error("Invalid password for user: ${passwordGrantAuth.username}")
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_GRANT))
        }

        // 5. 建立使用者的 Authentication 物件（用於 Token Context 和授權紀錄）
        val userAuthentication = UsernamePasswordAuthenticationToken(
            userDetails,
            userDetails.password,
            userDetails.authorities
        )

        // 6. 準備 Token 產生的上下文資訊 (Context)
        val authorizationServerContext = org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder.getContext()
        val tokenContext = DefaultOAuth2TokenContext.builder()
            .registeredClient(registeredClient)
            .principal(userAuthentication)  // 使用使用者的 Authentication，而非 Client 的
            .authorizationGrantType(passwordGrantAuth.getGrantType())
            .authorizedScopes(registeredClient.scopes ?: emptySet())
            .tokenType(OAuth2TokenType.ACCESS_TOKEN)
            .authorizationServerContext(authorizationServerContext)
            .build()

        // 7. 產生 Access Token
        val generatedAccessToken = tokenGenerator.generate(tokenContext)
            ?: throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR))

        val accessToken = OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER,
            generatedAccessToken.tokenValue,
            generatedAccessToken.issuedAt,
            generatedAccessToken.expiresAt,
            tokenContext.authorizedScopes
        )

        // 8. 產生 Refresh Token（如果 Client 支援 refresh_token grant type）
        var refreshToken: org.springframework.security.oauth2.core.OAuth2RefreshToken? = null
        if (registeredClient.authorizationGrantTypes.contains(org.springframework.security.oauth2.core.AuthorizationGrantType.REFRESH_TOKEN)) {
            val refreshTokenContext = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(userAuthentication)  // 使用使用者的 Authentication
                .authorizationGrantType(passwordGrantAuth.getGrantType())
                .authorizedScopes(registeredClient.scopes ?: emptySet())
                .tokenType(OAuth2TokenType.REFRESH_TOKEN)
                .authorizationServerContext(authorizationServerContext)
                .build()

            val generatedRefreshToken = tokenGenerator.generate(refreshTokenContext)
            if (generatedRefreshToken != null) {
                refreshToken = org.springframework.security.oauth2.core.OAuth2RefreshToken(
                    generatedRefreshToken.tokenValue,
                    generatedRefreshToken.issuedAt,
                    generatedRefreshToken.expiresAt
                )
            }
        }

        // 9. 建立並儲存授權紀錄 (Authorization Record)
        val authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
            .principalName(userDetails.username)
            .authorizationGrantType(passwordGrantAuth.getGrantType())
            .authorizedScopes(registeredClient.scopes ?: emptySet<String>())
            .attribute(java.security.Principal::class.java.name, userAuthentication)  // 使用 Principal.class.getName() 作為 key
            .accessToken(accessToken)

        // 如果有 Refresh Token，也一併儲存
        if (refreshToken != null) {
            authorizationBuilder.refreshToken(refreshToken)
        }

        val authorization = authorizationBuilder.build()
        authorizationService.save(authorization)

        // 10. 回傳成功的驗證 Token，包含核發的 Access Token 和 Refresh Token
        return OAuth2AccessTokenAuthenticationToken(
            registeredClient,
            clientPrincipal,
            accessToken,
            refreshToken
        )
    }

    override fun supports(authentication: Class<*>): Boolean {
        // 聲明此 Provider 支援處理 OAuth2PasswordGrantAuthenticationToken
        return OAuth2PasswordGrantAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

    /**
     * 從 SecurityContext 中取得已驗證的 Client 資訊
     * 在 Spring Authorization Server 流程中，Client 會先被驗證並存放在 SecurityContext
     */
    private fun getAuthenticatedClientElseThrowInvalidClient(): OAuth2ClientAuthenticationToken {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication is OAuth2ClientAuthenticationToken && authentication.isAuthenticated) {
            return authentication
        }
        throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_CLIENT))
    }
}
