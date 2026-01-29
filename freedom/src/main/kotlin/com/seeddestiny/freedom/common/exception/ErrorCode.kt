package com.seeddestiny.freedom.common.exception

import com.seeddestiny.freedom.common.utils.substitute
import org.springframework.http.HttpStatus
import java.io.Serializable

data class ErrorCode(
    val httpStatus: HttpStatus,
    val code: String,
    var message: String
) : Serializable {
    constructor(
        code: String,
        message: String
    ) : this(HttpStatus.BAD_REQUEST, code, message)

    fun substitute(vararg errorArguments: Pair<String, Any?>): String {
        return message.substitute(*errorArguments)
    }
}