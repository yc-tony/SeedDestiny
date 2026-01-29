package com.seeddestiny.freedom.resource.controller

import com.seeddestiny.freedom.common.model.ApiResponseOutput
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin/resource")
@PreAuthorize("#oauth2.hasScope('admin:resource')")
@Validated
class ResourceAdminController {

    /**
     * 這段要上傳3D模型的檔案
     */
    @PostMapping("/upload/resource")
    fun uploadResource(): ApiResponseOutput {

        return ApiResponseOutput(data = "resourceId" to "12345")
    }

    /**
     * 這段要上傳材質的檔案
     */
    @PostMapping("/upload/material")
    fun uploadMaterial(): ApiResponseOutput {
        return ApiResponseOutput(data = "materialId" to "67890")
    }

    /**
     * 更新資源資料
     */
    @PutMapping("/update/resource/{resourceId}")
    fun updateResource(@PathVariable resourceId: String): ApiResponseOutput {
        return ApiResponseOutput(data = "resourceId" to resourceId)
    }

    /**
     * 更新材質資料
     */
    @PutMapping("/update/material/{materialId}")
    fun updateMaterial(@PathVariable materialId: String): ApiResponseOutput {
        return ApiResponseOutput(data = "materialId" to materialId)
    }
}