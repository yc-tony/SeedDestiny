package com.seeddestiny.freedom.resource.exception

import com.seeddestiny.freedom.common.exception.ErrorCode
import org.springframework.http.HttpStatus

val RESOURCE_FILE_NOT_FOUND = ErrorCode(HttpStatus.BAD_REQUEST, "resource-0001", "Unsupported file format: %{fileExtension}")
val RESOURCE_NOT_FOUND = ErrorCode(HttpStatus.NOT_FOUND, "resource-0002", "Resource not found: %{resourceId}")
val MATERIAL_FILE_NOT_FOUND = ErrorCode(HttpStatus.BAD_REQUEST, "resource-0003", "Unsupported material file format: %{fileExtension}")
val FILE_NAME_IS_NOT_VALID = ErrorCode(HttpStatus.BAD_REQUEST, "resource-0004", "File name cannot be empty")
val MATERIAL_NOT_FOUND = ErrorCode(HttpStatus.NOT_FOUND, "resource-0005", "Material not found: %{materialId}")


