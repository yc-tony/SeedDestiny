package com.seeddestiny.freedom.resource.config

import com.google.common.cache.CacheBuilder
import com.seeddestiny.freedom.common.utils.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.Cache
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.concurrent.ConcurrentMapCache
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
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
        return object : ConcurrentMapCacheManager() {
            override fun createConcurrentMapCache(name: String): Cache {
                val expireTtl = cacheProperties.customCacheNames.get(name) ?: cacheProperties.defaultExpire
                return generateConcurrentMapCache(name, expireTtl)
            }
        }
    }

    private fun generateConcurrentMapCache(name: String, expire: Long): Cache {
        logger.info("Creating cache for name: $name with expire: $expire")
        return ConcurrentMapCache(
            name,
            CacheBuilder.newBuilder()
                .maximumSize(cacheProperties.maxSize)
                .expireAfterWrite(
                    expire,
                    TimeUnit.SECONDS
                )
                .recordStats()
                .build<Any, Any>()
                .asMap(),
            false
        )
    }
}
