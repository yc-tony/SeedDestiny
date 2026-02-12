package com.seeddestiny.freedom.resource.service

import com.seeddestiny.freedom.common.utils.logger
import com.seeddestiny.freedom.label.repository.LabelMapRepository
import com.seeddestiny.freedom.label.repository.LabelRepository
import com.seeddestiny.freedom.resource.config.ResourceProperties
import com.seeddestiny.freedom.resource.model.ResourcePublicOutputs
import com.seeddestiny.freedom.resource.model.asLabelOutput
import com.seeddestiny.freedom.resource.model.asMaterialOutput
import com.seeddestiny.freedom.resource.model.asResourcePublicOutput
import com.seeddestiny.freedom.resource.repository.MaterialRepository
import com.seeddestiny.freedom.resource.repository.ResourceRepository
import com.seeddestiny.freedom.resource.utils.convertToMaterialUrl
import com.seeddestiny.freedom.resource.utils.convertToResourceUrl
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

const val RESOURCE_PUBLIC_ALL_CACHE_NAME = "RESOURCE_PUBLIC_ALL"

@Service
class ResourceService {
    private val logger = logger()

    @Autowired
    private lateinit var cacheManager: CacheManager

    @Autowired
    private lateinit var resourceRepository: ResourceRepository

    @Autowired
    private lateinit var materialRepository: MaterialRepository

    @Autowired
    private lateinit var resourceProperties: ResourceProperties

    @Autowired
    private lateinit var labelMapRepository: LabelMapRepository

    @Autowired
    private lateinit var labelRepository: LabelRepository

    /**
     * 根據 ID 取得 Resource，優先從快取取得
     */
    @Cacheable(cacheNames = [RESOURCE_PUBLIC_ALL_CACHE_NAME])
    fun getResourcePublicAll(): ResourcePublicOutputs {
        logger.info("Get all resources")
        val resources = resourceRepository.findAllByLabelDisplay()
        val result = resources.map { resource ->
            resource.asResourcePublicOutput().apply {
                this.resourceUrl = resource.id?.convertToResourceUrl(resourceProperties.downloadFileDomain)
                this.labels = labelRepository.findAllByResourceId(resource.id!!).map {
                    it.asLabelOutput()
                }
                this.materials = materialRepository.findAllByReferenceId(resource.id!!).map {
                    it.asMaterialOutput().apply {
                        this.url = this.materialId?.convertToMaterialUrl(resourceProperties.downloadFileDomain)
                    }
                }
            }
        }

        return ResourcePublicOutputs(total = resources.size, records = result)
    }

    /**
     * 清除所有 Resource 列表的快取
     */
    fun evictAllResourcesCache() {
        cacheManager.getCache(RESOURCE_PUBLIC_ALL_CACHE_NAME)?.clear()
        logger.info("All resources cache evicted")
    }
}
