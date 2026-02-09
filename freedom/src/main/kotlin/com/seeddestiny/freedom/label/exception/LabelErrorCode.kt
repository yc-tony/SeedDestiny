package com.seeddestiny.freedom.label.exception

import com.seeddestiny.freedom.common.exception.ErrorCode
import org.springframework.http.HttpStatus

val LABEL_KEY_EXIST = ErrorCode(HttpStatus.BAD_REQUEST, "label-0001", "label key already exists: %{labelKey}")
val LABEL_NAME_IS_NULL = ErrorCode(HttpStatus.BAD_REQUEST, "label-0002", "label name cannot be null")