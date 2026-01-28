package com.seeddestiny.freedom.oauth.utils

import com.seeddestiny.freedom.oauth.model.OAuth2PasswordGrantAuthenticationToken
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames
import org.springframework.security.web.authentication.AuthenticationConverter
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap

/**
 * OAuth2 密碼模式請求轉換器
 * 負責從 HTTP 請求中提取 username 和 password，並將其轉換為 Authentication 物件
 */
class OAuth2PasswordGrantAuthenticationConverter : AuthenticationConverter {

    override fun convert(request: HttpServletRequest): Authentication? {
        // 檢查 grant_type 是否為 password
        val grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE)
        if (grantType != "password") {
            return null
        }

        // 提取所有請求參數
        val parameters: MultiValueMap<String, String> = LinkedMultiValueMap()
        request.parameterMap.forEach { (key, values) ->
            parameters[key] = values.toList()
        }

        // 提取使用者帳號與密碼
        val username = parameters.getFirst("username")
        val password = parameters.getFirst("password")

        // 封裝成自定義的 Authentication Token，交給 AuthenticationProvider 處理
        return OAuth2PasswordGrantAuthenticationToken(
            username = username ?: "",
            password = password ?: "",
            additionalParameters = parameters.toSingleValueMap()
        )
    }
}
