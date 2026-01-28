package com.seeddestiny.freedom.oauth.config

import com.seeddestiny.freedom.account.repository.AccountRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer

/**
 * JWT Token 客製化配置
 * 負責在生成的 JWT 中加入額外的 Claims (例如 accountId, applicationId)
 */
@Configuration
class OAuth2TokenCustomizerConfig(
    private val accountRepository: AccountRepository
) {

    @Bean
    fun tokenCustomizer(): OAuth2TokenCustomizer<JwtEncodingContext> {
        return OAuth2TokenCustomizer { context ->
            // 從授權上下文中取得使用者名稱
            val username = context.authorization?.principalName

            if (username != null) {
                val account = accountRepository.findByUsername(username)
                if (account != null) {
                    // 將使用者 ID 塞入 JWT Claims
                    context.claims.claim("accountId", account.id)
                }
            }

            // 從註冊的 Client 中取得應用程式 ID (clientId)
            val registeredClient = context.registeredClient
            registeredClient?.clientId?.let {
                // 將應用程式 ID 塞入 JWT Claims
                context.claims.claim("applicationId", it)
            }
        }
    }
}
