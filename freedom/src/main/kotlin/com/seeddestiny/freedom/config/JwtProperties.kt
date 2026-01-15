package com.seeddestiny.freedom.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "jwt")
class JwtProperties(
    var secret: String = "",
    var expiration: Long = 3600000
)
