package com.seeddestiny.freedom.common.model

data class ApiResponseOutput(val code: String = "0",val message: String? = null, val data: Any? = null)

fun Any?.asResponseOutput(): ApiResponseOutput = ApiResponseOutput(data = this)