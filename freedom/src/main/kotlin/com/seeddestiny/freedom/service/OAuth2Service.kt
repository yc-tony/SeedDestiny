package com.seeddestiny.freedom.service

import com.seeddestiny.freedom.config.JwtProperties
import com.seeddestiny.freedom.http.model.TokenRequest
import com.seeddestiny.freedom.http.model.TokenResponse
import com.seeddestiny.freedom.account.repository.AccountRepository
import com.seeddestiny.freedom.account.repository.ApplicationRepository
import com.seeddestiny.freedom.util.JwtUtil
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class OAuth2Service(
    private val applicationRepository: ApplicationRepository,
    private val accountRepository: AccountRepository,
    private val jwtUtil: JwtUtil,
    private val jwtProperties: JwtProperties
) {
    private val passwordEncoder = BCryptPasswordEncoder()

    fun authenticateAndGenerateToken(
        applicationId: String,
        applicationPassword: String,
        tokenRequest: TokenRequest
    ): TokenResponse {
        // Validate grant type
        if (tokenRequest.grantType != "password") {
            throw IllegalArgumentException("Unsupported grant type: ${tokenRequest.grantType}")
        }

        // Validate application credentials
        val application = applicationRepository.findByApplicationId(applicationId)
            ?: throw IllegalArgumentException("Invalid application credentials")

        if (!passwordEncoder.matches(applicationPassword, application.password)) {
            throw IllegalArgumentException("Invalid application credentials")
        }

        // Validate account credentials
        if (tokenRequest.username.isNullOrBlank() || tokenRequest.password.isNullOrBlank()) {
            throw IllegalArgumentException("Username and password are required")
        }

        val account = accountRepository.findByUsername(tokenRequest.username)
            ?: throw IllegalArgumentException("Invalid account credentials")

        if (!passwordEncoder.matches(tokenRequest.password, account.password)) {
            throw IllegalArgumentException("Invalid account credentials")
        }

        // Generate JWT token
        val token = jwtUtil.generateToken(application.id, account.id)

        return TokenResponse(
            accessToken = token,
            tokenType = "Bearer",
            expiresIn = jwtProperties.expiration
        )
    }
}
