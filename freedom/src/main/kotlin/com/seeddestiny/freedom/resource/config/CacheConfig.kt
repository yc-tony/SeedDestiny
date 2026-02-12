package com.seeddestiny.freedom.resource.config

import com.github.benmanes.caffeine.cache.Caffeine
import com.seeddestiny.freedom.common.utils.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit

@Configuration
@EnableCaching
class CacheConfig {
    private val logger = logger()

    @Autowired
    private lateinit var cacheProperties: CacheProperties

    @Bean
    fun cacheManager(): CacheManager {
        val cacheManager = object : CaffeineCacheManager() {
            override fun createNativeCaffeineCache(name: String): com.github.benmanes.caffeine.cache.Cache<Any, Any> {
                val expireTtl = cacheProperties.customCacheNames[name] ?: cacheProperties.defaultExpire
                logger.info("Creating cache for name: $name with expire: $expireTtl")
                return Caffeine.newBuilder()
                    .maximumSize(cacheProperties.maxSize)
                    .expireAfterWrite(expireTtl, TimeUnit.SECONDS)
                    .recordStats()
                    .build()
            }
        }
        return cacheManager
    }
}
