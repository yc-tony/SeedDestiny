package com.seeddestiny.freedom.oauth

import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
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
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator

class OAuth2PasswordGrantAuthenticationProvider(
    private val registeredClientRepository: RegisteredClientRepository,
    private val authorizationService: OAuth2AuthorizationService,
    private val tokenGenerator: OAuth2TokenGenerator<*>,
    private val userDetailsService: UserDetailsService,
    private val passwordEncoder: PasswordEncoder
) : AuthenticationProvider {

    override fun authenticate(authentication: Authentication): Authentication {
        val passwordGrantAuth = authentication as OAuth2PasswordGrantAuthenticationToken

        // Get client authentication
        val clientPrincipal = getAuthenticatedClientElseThrowInvalidClient(authentication)
        val registeredClient = clientPrincipal.registeredClient
            ?: throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_CLIENT))

        // Validate grant type
        if (!registeredClient.authorizationGrantTypes.contains(passwordGrantAuth.getGrantType())) {
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT))
        }

        // Authenticate user
        val userDetails = try {
            userDetailsService.loadUserByUsername(passwordGrantAuth.username)
        } catch (e: Exception) {
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_GRANT))
        }

        if (!passwordEncoder.matches(passwordGrantAuth.password, userDetails.password)) {
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_GRANT))
        }

        // Generate token
        val tokenContext = DefaultOAuth2TokenContext.builder()
            .registeredClient(registeredClient)
            .principal(clientPrincipal)
            .authorizationGrantType(passwordGrantAuth.getGrantType())
            .authorizedScopes(registeredClient.scopes ?: emptySet())
            .tokenType(OAuth2TokenType.ACCESS_TOKEN)
            .build()

        val generatedAccessToken = tokenGenerator.generate(tokenContext)
            ?: throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR))

        val accessToken = OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER,
            generatedAccessToken.tokenValue,
            generatedAccessToken.issuedAt,
            generatedAccessToken.expiresAt,
            tokenContext.authorizedScopes
        )

        // Build authorization
        val authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
            .principalName(userDetails.username)
            .authorizationGrantType(passwordGrantAuth.getGrantType())
            .attribute("username", userDetails.username)

        val authorization = authorizationBuilder
            .accessToken(accessToken)
            .build()

        authorizationService.save(authorization)

        return OAuth2AccessTokenAuthenticationToken(
            registeredClient,
            clientPrincipal,
            accessToken
        )
    }

    override fun supports(authentication: Class<*>): Boolean {
        return OAuth2PasswordGrantAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

    private fun getAuthenticatedClientElseThrowInvalidClient(authentication: Authentication): OAuth2ClientAuthenticationToken {
        var clientPrincipal: OAuth2ClientAuthenticationToken? = null
        if (OAuth2ClientAuthenticationToken::class.java.isAssignableFrom(authentication.javaClass)) {
            clientPrincipal = authentication as OAuth2ClientAuthenticationToken
        }
        if (clientPrincipal != null && clientPrincipal.isAuthenticated) {
            return clientPrincipal
        }
        throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_CLIENT))
    }
}
