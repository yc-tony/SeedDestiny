package com.seeddestiny.freedom.oauth.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

/**
 * 通用安全配置
 * 定義預設的登入行為與 API 存取權限控制
 */
@Configuration
@EnableWebSecurity
class SecurityConfig {

    /**
     * 預設安全過濾鏈，處理一般的 HTTP 請求
     * 使用 OAuth2 Resource Server 來驗證 JWT Token
     */
    @Bean
    @Order(2)
    fun defaultSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .authorizeHttpRequests { authorize ->
                authorize
                    .requestMatchers("/h2-console/**").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt(Customizer.withDefaults())
            }
            .exceptionHandling { exceptions ->
                // 未授權時回傳 401 JSON，而非跳轉登入頁面
                exceptions.authenticationEntryPoint { request, response, authException ->
                    response.status = 401
                    response.contentType = "application/json;charset=UTF-8"
                    response.writer.write(
                        """{"error":"unauthorized","error_description":"${authException.message}"}"""
                    )
                }
            }
            .csrf { it.disable() }  // 停用 CSRF（API 模式）
            .headers { headers ->
                headers.frameOptions { it.sameOrigin() }           // 允許 iframe（H2 Console 需要）
            }

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
}
