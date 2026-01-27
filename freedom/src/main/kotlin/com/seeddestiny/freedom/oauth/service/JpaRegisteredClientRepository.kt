package com.seeddestiny.freedom.oauth.service

import com.seeddestiny.freedom.application.model.Application
import com.seeddestiny.freedom.application.repository.ApplicationRepository
import com.seeddestiny.freedom.common.utils.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class JpaRegisteredClientRepository: RegisteredClientRepository {
    private val logger = logger()

    @Autowired
    private lateinit var applicationRepository: ApplicationRepository

    override fun save(registeredClient: RegisteredClient) {
        // Not implemented - we manage clients through Application entity
        throw UnsupportedOperationException("Use Application entity to manage clients")
    }

    override fun findById(id: String): RegisteredClient? {
        return try {
            val application = applicationRepository.findById(id)?.orElse(null) ?: return null
            mapToRegisteredClient(application)
        } catch (e: IllegalArgumentException) {
            logger.error("Error finding application by ID: $id", e)
            null
        }
    }

    override fun findByClientId(clientId: String): RegisteredClient? {
        return findById(clientId)
    }

    private fun mapToRegisteredClient(application: Application): RegisteredClient {
        val scopes = application.oauthScopes?.split(",")?.map { it.trim() }?.toSet() ?: emptySet()

        /**
         * password
         * refresh_token
         * client_credentials
         */
        val grantTypes = application.grantTypes?.split(",")?.map { it.trim() }?.toSet() ?: emptySet()

        val registeredClient = RegisteredClient.withId(application.id)
            .clientId(application.id)
            .clientSecret(application.password)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
            .scopes { it.addAll(scopes) }
            .tokenSettings(
                TokenSettings.builder()
                    .accessTokenTimeToLive(Duration.parse(application.accessExpires ?: "PT5M"))
                    .refreshTokenTimeToLive(Duration.parse(application.refreshExpires ?: "PT10M"))
                    .build()
            )

        for (grantType in grantTypes) {
            registeredClient.authorizationGrantType(AuthorizationGrantType(grantType))
        }


        return registeredClient.build()
    }
}
