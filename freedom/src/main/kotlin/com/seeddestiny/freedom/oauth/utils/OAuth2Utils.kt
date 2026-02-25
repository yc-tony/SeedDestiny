package com.seeddestiny.freedom.oauth.utils

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt

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