package com.seeddestiny.freedom.resource.controller

import com.seeddestiny.freedom.common.exception.SeedException
import com.seeddestiny.freedom.common.model.ApiResponseOutput
import com.seeddestiny.freedom.resource.config.ResourceProperties
import com.seeddestiny.freedom.resource.exception.FILE_NAME_IS_NOT_VALID
import com.seeddestiny.freedom.resource.exception.MATERIAL_FILE_NOT_FOUND
import com.seeddestiny.freedom.resource.exception.RESOURCE_FILE_NOT_FOUND
import com.seeddestiny.freedom.resource.exception.RESOURCE_NOT_FOUND
import com.seeddestiny.freedom.resource.model.Material
import com.seeddestiny.freedom.resource.model.MaterialFileType
import com.seeddestiny.freedom.resource.model.Resource
import com.seeddestiny.freedom.resource.model.ResourceFileType
import com.seeddestiny.freedom.resource.repository.MaterialRepository
import com.seeddestiny.freedom.resource.repository.ResourceRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*

@RestController
@RequestMapping("/admin/resource")
@PreAuthorize("#oauth2.hasScope('admin:resource')")
@Validated
class ResourceAdminController {

    @Autowired
    private lateinit var resourceProperties: ResourceProperties

    @Autowired
    private lateinit var resourceRepository: ResourceRepository

    @Autowired
    private lateinit var materialRepository: MaterialRepository

    /**
     * 這段要上傳3D模型的檔案
     * 如果有帶 resourceId 則為更新檔案，會將舊檔案重新命名為 DELETE_ 開頭
     */
    @PostMapping("/upload/resource")
    fun uploadResource(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("resourceId", required = false) resourceId: String?
    ): ApiResponseOutput {
        // 1. 檢查檔案副檔名是否為支援的3D模型格式
        val originalFilename = file.originalFilename
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "檔案名稱不能為空")

        val fileExtension = originalFilename.substringAfterLast('.', "").uppercase()
        val resourceFileType = try {
            ResourceFileType.valueOf(fileExtension)
        } catch (e: IllegalArgumentException) {
            throw SeedException(RESOURCE_FILE_NOT_FOUND, "fileExtension" to fileExtension)
        }

        // 2. 如果是更新檔案，先取得舊檔案資訊（但不處理）
        val existingResource = resourceId?.let { resourceRepository.findByIdOrNull(it) }
        val oldFilePath = existingResource?.filePath

        // 3. 儲存新檔案
        val uploadDir = File(resourceProperties.uploadFilePath, "resources")
        if (!uploadDir.exists()) {
            uploadDir.mkdirs()
        }

        val uniqueFilename = "${UUID.randomUUID()}_$originalFilename"
        val filePath = Paths.get(uploadDir.absolutePath, uniqueFilename)
        Files.copy(file.inputStream, filePath)

        // 4. 建立或更新 Resource 資料
        val resource = existingResource?.copy(
            fileType = resourceFileType,
            filePath = filePath.toString()
        )
            ?: Resource(
                fileType = resourceFileType,
                filePath = filePath.toString()
            )
        val savedResource = resourceRepository.saveAndFlush(resource)

        // 5. 新檔案上傳成功後，再處理舊檔案
        if (oldFilePath != null) {
            val oldFile = File(oldFilePath)
            if (oldFile.exists()) {
                val oldFileName = oldFile.name
                val oldFileParent = oldFile.parentFile
                val newOldFileName = "DELETE_$oldFileName"
                val renamedFile = File(oldFileParent, newOldFileName)
                oldFile.renameTo(renamedFile)
            }
        }

        // 6. 回傳 resourceId
        return ApiResponseOutput(data = mapOf("resourceId" to savedResource.id))
    }

    /**
     * 這段要上傳材質的檔案
     * 必帶 resourceId
     * 如果有帶 materialId 則為更新檔案，會將舊檔案重新命名為 DELETE_ 開頭
     */
    @PostMapping("/upload/material")
    fun uploadMaterial(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("resourceId") resourceId: String,
        @RequestParam("materialId", required = false) materialId: String?
    ): ApiResponseOutput {
        // 1. 檢查 resource 是否存在
        val resource = resourceRepository.findByIdOrNull(resourceId)
            ?: throw SeedException(RESOURCE_NOT_FOUND, "resourceId" to resourceId)

        // 檢查檔案副檔名是否為支援的材質格式
        val originalFilename = file.originalFilename
            ?: throw SeedException(FILE_NAME_IS_NOT_VALID)

        val fileExtension = originalFilename.substringAfterLast('.', "").uppercase()
        val materialFileType = try {
            MaterialFileType.valueOf(fileExtension)
        } catch (e: IllegalArgumentException) {
            throw SeedException(MATERIAL_FILE_NOT_FOUND, "fileExtension" to fileExtension)
        }

        // 2. 如果是更新檔案，先取得舊檔案資訊（但不處理）
        val existingMaterial = materialId?.let { materialRepository.findByIdOrNull(it) }
        val oldFilePath = existingMaterial?.filePath

        // 3. 上傳材質到與 resource 相同的目錄
        val resourceFilePath = File(resource.filePath ?: "")
        val uploadDir = resourceFilePath.parentFile ?: File(resourceProperties.uploadFilePath, "resources")
        if (!uploadDir.exists()) {
            uploadDir.mkdirs()
        }

        val uniqueFilename = "${UUID.randomUUID()}_$originalFilename"
        val filePath = Paths.get(uploadDir.absolutePath, uniqueFilename)
        Files.copy(file.inputStream, filePath)

        // 4. 建立或更新 Material 資料
        val material = existingMaterial?.copy(
            referenceId = resourceId,
            fileType = materialFileType,
            filePath = filePath.toString()
        )
            ?: Material(
                referenceId = resourceId,
                fileType = materialFileType,
                filePath = filePath.toString()
            )
        val savedMaterial = materialRepository.saveAndFlush(material)

        // 5. 新檔案上傳成功後，再處理舊檔案
        if (oldFilePath != null) {
            val oldFile = File(oldFilePath)
            if (oldFile.exists()) {
                val oldFileName = oldFile.name
                val oldFileParent = oldFile.parentFile
                val newOldFileName = "DELETE_$oldFileName"
                val renamedFile = File(oldFileParent, newOldFileName)
                oldFile.renameTo(renamedFile)
            }
        }

        return ApiResponseOutput(data = mapOf("materialId" to savedMaterial.id))
    }

    /**
     * 更新資源資料
     */
    @PutMapping("/update/resource/{resourceId}")
    fun updateResource(
        @PathVariable resourceId: String,
        @RequestParam("title") title: String
    ): ApiResponseOutput {
        val resource = resourceRepository.findByIdOrNull(resourceId)
            ?: throw SeedException(RESOURCE_NOT_FOUND, "resourceId" to resourceId)

        resource.title = title
        val updatedResource = resourceRepository.saveAndFlush(resource)

        return ApiResponseOutput(data = updatedResource)
    }

    /**
     * 更新材質資料
     */
    @PutMapping("/update/material/{materialId}")
    fun updateMaterial(
        @PathVariable materialId: String,
        @RequestParam("title") title: String
    ): ApiResponseOutput {
        val material = materialRepository.findByIdOrNull(materialId)
            ?: throw SeedException(RESOURCE_NOT_FOUND, "materialId" to materialId)

        material.title = title
        val updatedMaterial = materialRepository.saveAndFlush(material)

        return ApiResponseOutput(data = updatedMaterial)
    }

    /**
     * 取得所有資源及其材質的摘要資訊
     */
    @GetMapping("/all")
    fun getAllResources(): ApiResponseOutput {
        val resources = resourceRepository.findAll()
        return ApiResponseOutput(data = resources)
    }

    @GetMapping("/materials/{resourceId}")
    fun getAllMaterialsByResource(@PathVariable resourceId: String): ApiResponseOutput {
        val materials = materialRepository.findAllByReferenceId(resourceId)
        return ApiResponseOutput(data = materials)
    }
}