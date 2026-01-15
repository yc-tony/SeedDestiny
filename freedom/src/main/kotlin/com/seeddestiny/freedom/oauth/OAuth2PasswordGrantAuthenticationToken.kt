package com.seeddestiny.freedom.oauth

import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.AuthorizationGrantType

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

    fun getGrantType(): AuthorizationGrantType = AuthorizationGrantType("password")
}
