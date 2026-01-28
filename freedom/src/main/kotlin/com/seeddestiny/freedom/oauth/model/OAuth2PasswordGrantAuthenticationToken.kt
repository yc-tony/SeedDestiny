package com.seeddestiny.freedom.oauth.model

import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.AuthorizationGrantType

/**
 * 自定義 OAuth2 密碼模式驗證 Token
 * 存放從請求中提取的 username、password 與額外參數
 */
class OAuth2PasswordGrantAuthenticationToken(
    val username: String,
    val password: String,
    val additionalParameters: Map<String, String>
) : Authentication {

    private var authenticated = false

    override fun getName(): String = username

    override fun getAuthorities() = emptyList<Nothing>()

    override fun getCredentials() = password

    override fun getDetails() = additionalParameters

    override fun getPrincipal() = username

    override fun isAuthenticated() = authenticated

    override fun setAuthenticated(isAuthenticated: Boolean) {
        this.authenticated = isAuthenticated
    }

    /**
     * 回傳此 Token 對應的授權類型 (Grant Type)
     */
    fun getGrantType(): AuthorizationGrantType = AuthorizationGrantType("password")
}