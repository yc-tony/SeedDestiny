package com.seeddestiny.freedom.controller

import com.seeddestiny.freedom.http.model.ErrorResponse
import com.seeddestiny.freedom.http.model.TokenRequest
import com.seeddestiny.freedom.service.OAuth2Service
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.Base64

@RestController
@RequestMapping("/oauth")
class OAuth2Controller(
    private val oAuth2Service: OAuth2Service
) {

    @PostMapping("/token")
    fun token(
        @RequestHeader("Authorization") authorization: String?,
        @RequestBody tokenRequest: TokenRequest
    ): ResponseEntity<*> {
        return try {
            // Parse Basic Auth header
            if (authorization == null || !authorization.startsWith("Basic ")) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse("invalid_client", "Missing or invalid Authorization header"))
            }

            val base64Credentials = authorization.substring("Basic ".length).trim()
            val credentials = String(Base64.getDecoder().decode(base64Credentials))
            val parts = credentials.split(":", limit = 2)

            if (parts.size != 2) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse("invalid_client", "Invalid Authorization header format"))
            }

            val applicationId = parts[0]
            val applicationPassword = parts[1]

            // Authenticate and generate token
            val tokenResponse = oAuth2Service.authenticateAndGenerateToken(
                applicationId,
                applicationPassword,
                tokenRequest
            )

            ResponseEntity.ok(tokenResponse)
        } catch (e: IllegalArgumentException) {
            ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse("invalid_grant", e.message ?: "Authentication failed"))
        } catch (e: Exception) {
            ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse("server_error", "An unexpected error occurred"))
        }
    }
}
