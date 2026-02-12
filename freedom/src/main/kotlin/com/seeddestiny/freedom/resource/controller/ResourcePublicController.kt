package com.seeddestiny.freedom.resource.controller

import com.seeddestiny.freedom.common.exception.SeedException
import com.seeddestiny.freedom.common.model.ApiResponseOutput
import com.seeddestiny.freedom.common.model.asResponseOutput
import com.seeddestiny.freedom.common.utils.logger
import com.seeddestiny.freedom.resource.exception.RESOURCE_NOT_FOUND
import com.seeddestiny.freedom.resource.repository.MaterialRepository
import com.seeddestiny.freedom.resource.repository.ResourceRepository
import com.seeddestiny.freedom.resource.service.ResourceService
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.FileSystemResource
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.util.StreamUtils
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.io.File
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@RestController
@RequestMapping("/public/resource")
class ResourcePublicController {
    private val logger = logger()

    @Autowired
    private lateinit var resourceRepository: ResourceRepository

    @Autowired
    private lateinit var resourceService: ResourceService

    @Autowired
    private lateinit var materialRepository: MaterialRepository



    @GetMapping("/all")
    fun getAllResourceInfo(): ApiResponseOutput {
        return resourceService.getResourcePublicAll().asResponseOutput()
    }


    /**
     * 3. 檔案下載
     */
    @GetMapping("/download/{type}/{id}")
    fun downloadFile(
        @PathVariable type: String,
        @PathVariable id: String,
        response: HttpServletResponse
    ) {
        val filePath = when (type) {
            "resource" -> {
                val resource = resourceRepository.findByIdOrNull(id)
                    ?: throw SeedException(RESOURCE_NOT_FOUND, "id" to id)
                resource.filePath
            }

            "material" -> {
                val material = materialRepository.findByIdOrNull(id)
                    ?: throw SeedException(RESOURCE_NOT_FOUND, "id" to id)
                material.filePath
            }

            else -> throw SeedException(RESOURCE_NOT_FOUND, "type" to type)
        }
        logger.info("File path: $filePath")
        if (filePath.isNullOrEmpty()) {
            throw SeedException(RESOURCE_NOT_FOUND, "detail" to "File path is empty")
        }

        val file = File(filePath)
        if (!file.exists()) {
            throw SeedException(RESOURCE_NOT_FOUND, "detail" to "File not found on disk")
        }

        val originalFilename = getOriginalFilename(file.name)
        val encodedFilename = URLEncoder.encode(originalFilename, StandardCharsets.UTF_8.toString()).replace("+", "%20")

        // 設定 Response Header
        response.contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE
        response.setHeader(
            HttpHeaders.CONTENT_DISPOSITION,
            "inline; filename=\"$encodedFilename\"; filename*=UTF-8''$encodedFilename"
        )
        response.setHeader(HttpHeaders.CONTENT_LENGTH, file.length().toString())

        // 串流輸出
        FileSystemResource(file).inputStream.use { inputStream ->
            StreamUtils.copy(inputStream, response.outputStream)
        }
    }

    // Helper: 去除 UUID 前綴取得原始檔名
    // 檔名格式通常為: UUID_OriginalName，UUID 標準長度為 36，加上底線為 37
    // 但在 ResourceAdminController 實作中:
    // val uniqueFilename = "${UUID.randomUUID()}_$originalFilename"
    private fun getOriginalFilename(uniqueFilename: String): String {
        // 簡單判斷：如果長度大於 37 且第 37 個字元是 '_' (index 36)
        if (uniqueFilename.length > 37 && uniqueFilename[36] == '_') {
            return uniqueFilename.substring(37)
        }
        // 如果格式不符，直接回傳原檔名
        return uniqueFilename
    }
}
