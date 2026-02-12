package com.seeddestiny.freedom.resource.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@ConfigurationProperties(prefix = "seed.cache")
class CacheProperties(
    val maxSize: Long = 1000,
    val defaultExpire: Long = 3600,
    val customCacheNames: Map<String, Long> = emptyMap()
)
