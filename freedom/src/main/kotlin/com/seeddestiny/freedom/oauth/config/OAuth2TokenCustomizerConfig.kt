package com.seeddestiny.freedom.oauth.config

import com.seeddestiny.freedom.account.repository.AccountRepository
import com.seeddestiny.freedom.application.repository.ApplicationRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer

@Configuration
class OAuth2TokenCustomizerConfig(
    private val applicationRepository: ApplicationRepository,
    private val accountRepository: AccountRepository
) {

    @Bean
    fun tokenCustomizer(): OAuth2TokenCustomizer<JwtEncodingContext> {
        return OAuth2TokenCustomizer { context ->
            // Get username from context
            val username = context.authorization?.principalName

            if (username != null) {
                val account = accountRepository.findByUsername(username)
                if (account != null) {
                    // Add account ID to JWT claims
                    context.claims.claim("accountId", account.id)
                }
            }

            // Get application ID from registered client
            val registeredClient = context.registeredClient
            registeredClient?.clientId?.let {
                // Add application ID to JWT claims
                context.claims.claim("applicationId", it)
            }
        }
    }
}
