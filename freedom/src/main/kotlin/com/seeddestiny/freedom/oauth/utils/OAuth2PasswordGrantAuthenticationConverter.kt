package com.seeddestiny.freedom.oauth.utils

import com.seeddestiny.freedom.oauth.model.OAuth2PasswordGrantAuthenticationToken
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames
import org.springframework.security.web.authentication.AuthenticationConverter
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap

class OAuth2PasswordGrantAuthenticationConverter : AuthenticationConverter {

    override fun convert(request: HttpServletRequest): Authentication? {
        val grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE)
        if (grantType != "password") {
            return null
        }

        val parameters: MultiValueMap<String, String> = LinkedMultiValueMap()
        request.parameterMap.forEach { (key, values) ->
            parameters[key] = values.toList()
        }

        val username = parameters.getFirst("username")
        val password = parameters.getFirst("password")

        return OAuth2PasswordGrantAuthenticationToken(
            username = username ?: "",
            password = password ?: "",
            additionalParameters = parameters.toSingleValueMap()
        )
    }
}
