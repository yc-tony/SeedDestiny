package com.seeddestiny.freedom.http.model

data class ErrorResponse(
    val error: String,
    val errorDescription: String? = null
)
