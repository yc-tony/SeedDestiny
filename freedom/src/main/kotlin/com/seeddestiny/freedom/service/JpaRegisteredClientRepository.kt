package com.seeddestiny.freedom.service

import com.seeddestiny.freedom.account.repository.ApplicationRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class JpaRegisteredClientRepository(
    private val applicationRepository: ApplicationRepository,
    private val passwordEncoder: PasswordEncoder
) : RegisteredClientRepository {

    override fun save(registeredClient: RegisteredClient) {
        // Not implemented - we manage clients through Application entity
        throw UnsupportedOperationException("Use Application entity to manage clients")
    }

    override fun findById(id: String): RegisteredClient? {
        return try {
            val uuid = java.util.UUID.fromString(id)
            val application = applicationRepository.findById(uuid).orElse(null) ?: return null
            mapToRegisteredClient(application)
        } catch (e: IllegalArgumentException) {
            null
        }
    }

    override fun findByClientId(clientId: String): RegisteredClient? {
        val application = applicationRepository.findByApplicationId(clientId) ?: return null
        return mapToRegisteredClient(application)
    }

    private fun mapToRegisteredClient(application: com.seeddestiny.freedom.account.model.Application): RegisteredClient {
        val scopes = application.oauthScopes.split(",").map { it.trim() }.toSet()

        return RegisteredClient.withId(application.id.toString())
            .clientId(application.applicationId)
            .clientSecret(application.password)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
            .authorizationGrantType(AuthorizationGrantType("password"))
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .scopes { it.addAll(scopes) }
            .tokenSettings(
                TokenSettings.builder()
                    .accessTokenTimeToLive(Duration.ofHours(1))
                    .refreshTokenTimeToLive(Duration.ofDays(30))
                    .build()
            )
            .build()
    }
}
