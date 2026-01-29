package com.seeddestiny.freedom.oauth.config

import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.source.ImmutableJWKSet
import com.nimbusds.jose.jwk.source.JWKSource
import com.nimbusds.jose.proc.SecurityContext
import com.seeddestiny.freedom.oauth.utils.OAuth2PasswordGrantAuthenticationConverter
import com.seeddestiny.freedom.oauth.utils.OAuth2PasswordGrantAuthenticationProvider
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings
import org.springframework.security.oauth2.server.authorization.token.*
import org.springframework.security.web.SecurityFilterChain
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.*

/**
 * OAuth2 授權伺服器配置
 * 定義 OAuth2 端點、驗證器、Token 生成方式以及安全過濾鏈
 */
@Configuration
class AuthorizationServerConfig(
    private val authorizationService: OAuth2AuthorizationService,
    private val userDetailsService: UserDetailsService,
    private val passwordEncoder: PasswordEncoder
) {

    /**
     * 配置授權伺服器的安全過濾鏈
     */
    @Bean
    @Order(1)
    fun authorizationServerSecurityFilterChain(
        http: HttpSecurity,
        tokenGenerator: OAuth2TokenGenerator<*>
    ): SecurityFilterChain {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http)

        http.getConfigurer(OAuth2AuthorizationServerConfigurer::class.java)
            .tokenEndpoint { tokenEndpoint ->
                // 註冊自定義的密碼模式轉換器與驗證處理器
                tokenEndpoint
                    .accessTokenRequestConverter(OAuth2PasswordGrantAuthenticationConverter())
                    .authenticationProvider(
                        OAuth2PasswordGrantAuthenticationProvider(
                            authorizationService,
                            tokenGenerator,
                            userDetailsService,
                            passwordEncoder
                        )
                    )
            }
            .oidc(Customizer.withDefaults())

        http
            .oauth2ResourceServer { resourceServer ->
                resourceServer.jwt(Customizer.withDefaults())
            }

        return http.build()
    }

    /**
     * 配置 Token 產生器，支持 JWT 和 Access/Refresh Token 的生成
     */
    @Bean
    fun tokenGenerator(
        jwtEncoder: JwtEncoder,
        customizer: OAuth2TokenCustomizer<JwtEncodingContext>
    ): OAuth2TokenGenerator<*> {
        val jwtGenerator = JwtGenerator(jwtEncoder)
        jwtGenerator.setJwtCustomizer(customizer)
        val accessTokenGenerator = OAuth2AccessTokenGenerator()
        val refreshTokenGenerator = OAuth2RefreshTokenGenerator()
        return DelegatingOAuth2TokenGenerator(
            jwtGenerator, accessTokenGenerator, refreshTokenGenerator
        )
    }

    @Bean
    fun jwtEncoder(jwkSource: JWKSource<SecurityContext>): JwtEncoder {
        return NimbusJwtEncoder(jwkSource)
    }

    @Bean
    fun authorizationServerSettings(): AuthorizationServerSettings {
        return AuthorizationServerSettings.builder()
            .build()
    }

    @Bean
    fun jwkSource(): JWKSource<SecurityContext> {
        val keyPair = generateRsaKey()
        val publicKey = keyPair.public as RSAPublicKey
        val privateKey = keyPair.private as RSAPrivateKey
        val rsaKey = RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(UUID.randomUUID().toString())
            .build()
        val jwkSet = JWKSet(rsaKey)
        return ImmutableJWKSet(jwkSet)
    }

    @Bean
    fun jwtDecoder(jwkSource: JWKSource<SecurityContext>): JwtDecoder {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource)
    }

    private fun generateRsaKey(): KeyPair {
        val keyPairGenerator = KeyPairGenerator.getInstance("RSA")
        keyPairGenerator.initialize(2048)
        return keyPairGenerator.generateKeyPair()
    }
}