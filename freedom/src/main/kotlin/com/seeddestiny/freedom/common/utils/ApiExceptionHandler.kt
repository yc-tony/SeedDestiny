package com.seeddestiny.freedom.common.utils

import com.seeddestiny.freedom.common.exception.SeedException
import com.seeddestiny.freedom.common.model.ApiResponseOutput
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    private val logger = logger()

    @ExceptionHandler(SeedException::class)
    fun handleSeedException(ex: SeedException): ResponseEntity<ApiResponseOutput> {
        logger.warn("SeedException: ${ex.message}", ex)
        return ResponseEntity.status(ex.errorCode.httpStatus)
            .body(ApiResponseOutput(code = ex.errorCode.code, message = ex.message))
    }
}