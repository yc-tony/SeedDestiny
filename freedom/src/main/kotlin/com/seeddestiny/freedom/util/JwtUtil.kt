package com.seeddestiny.freedom.util

import com.seeddestiny.freedom.config.JwtProperties
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil(
    private val jwtProperties: JwtProperties
) {
    private val secretKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
    }

    fun generateToken(applicationId: UUID, accountId: UUID): String {
        val now = Date()
        val expiryDate = Date(now.time + (jwtProperties.expiration * 1000))

        return Jwts.builder()
            .subject(accountId.toString())
            .claim("applicationId", applicationId.toString())
            .claim("accountId", accountId.toString())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getApplicationIdFromToken(token: String): UUID? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .payload
            UUID.fromString(claims["applicationId"] as String)
        } catch (e: Exception) {
            null
        }
    }

    fun getAccountIdFromToken(token: String): UUID? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .payload
            UUID.fromString(claims["accountId"] as String)
        } catch (e: Exception) {
            null
        }
    }
}
