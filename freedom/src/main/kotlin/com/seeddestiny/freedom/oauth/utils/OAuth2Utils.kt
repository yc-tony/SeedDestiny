package com.seeddestiny.freedom.oauth.utils

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2ErrorCodes
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken

fun getAccountId(): String {
    val authentication = SecurityContextHolder.getContext().authentication

    // 将 principal 转换为 Jwt 对象
    val jwt = authentication.principal as Jwt

    // 方法 1: 直接从 claims 中获取 accountId
    val accountId = jwt.getClaim<String>("accountId")

    return accountId ?: ""
}

fun getApplicationId(): String {
    val authentication = SecurityContextHolder.getContext().authentication

    // 将 principal 转换为 Jwt 对象
    val jwt = authentication.principal as Jwt

    // 方法 1: 直接从 claims 中获取 applicationId
    val applicationId = jwt.getClaim<String>("applicationId")

    return applicationId ?: ""
}

/**
 * 從 SecurityContext 中取得已驗證的 Client 資訊
 * 在 Spring Authorization Server 流程中，Client 會先被驗證並存放在 SecurityContext
 */
fun getAuthenticatedClientElseThrowInvalidClient(): OAuth2ClientAuthenticationToken {
    val authentication = SecurityContextHolder.getContext().authentication
    if (authentication is OAuth2ClientAuthenticationToken && authentication.isAuthenticated) {
        return authentication
    }
    throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_CLIENT))
}