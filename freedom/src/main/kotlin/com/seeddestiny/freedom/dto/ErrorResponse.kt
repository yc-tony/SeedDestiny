package com.seeddestiny.freedom.dto

data class ErrorResponse(
    val error: String,
    val errorDescription: String? = null
)
