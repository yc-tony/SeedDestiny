package com.seeddestiny.freedom.common.exception

import com.seeddestiny.freedom.common.utils.substitute


class SeedException(
    override val cause: Throwable?,
    val errorCode: ErrorCode,
    vararg val errorArguments: Pair<String, Any?>
) : RuntimeException(errorCode.substitute(*errorArguments), cause) {
    constructor(
        errorCode: ErrorCode,
        vararg errorArguments: Pair<String, Any?>
    ) : this(null, errorCode, *errorArguments)

    override fun toString(): String {
        return "${errorCode.code} : ${errorCode.message.substitute(*errorArguments)}"
    }
}
