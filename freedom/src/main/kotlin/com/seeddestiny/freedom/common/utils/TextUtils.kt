package com.seeddestiny.freedom.common.utils

import org.apache.commons.text.StringSubstitutor

const val DEFAULT_PREFIX = "%{"
const val DEFAULT_SUFFIX = "}"

fun String.substitute(
    prefix: String,
    vararg values: Pair<String, Any?>
): String =
    StringSubstitutor.replace(this, values.toMap(), prefix, DEFAULT_SUFFIX)

fun String.substitute(vararg values: Pair<String, Any?>): String {
    return substitute(DEFAULT_PREFIX, *values)
}