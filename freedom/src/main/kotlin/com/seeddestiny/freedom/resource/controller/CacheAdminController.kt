package com.seeddestiny.freedom.resource.controller

import com.seeddestiny.freedom.common.model.ApiResponseOutput
import com.seeddestiny.freedom.resource.service.ResourceService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/admin/cache")
@PreAuthorize("#oauth2.hasScope('admin:cache')")
class CacheAdminController {

    @Autowired
    private lateinit var resourceService: ResourceService

    /**
     * 清除所有 Resource 列表的快取
     */
    @DeleteMapping("/resources/all")
    fun evictAllResourcesCache(): ApiResponseOutput {
        resourceService.evictAllResourcesCache()
        return ApiResponseOutput(data = mapOf("message" to "All resources cache evicted"))
    }
}
