package com.seeddestiny.freedom.resource.exception

import com.seeddestiny.freedom.common.exception.ErrorCode
import org.springframework.http.HttpStatus

val RESOURCE_FILE_NOT_FOUND = ErrorCode(HttpStatus.BAD_REQUEST, "resource-0001", "不支援的檔案格式: %{fileExtension}")
val RESOURCE_NOT_FOUND = ErrorCode(HttpStatus.NOT_FOUND, "resource-0002", "找不到資源: %{resourceId}")
val MATERIAL_FILE_NOT_FOUND = ErrorCode(HttpStatus.BAD_REQUEST, "resource-0003", "不支援的材質檔案格式: %{fileExtension}")