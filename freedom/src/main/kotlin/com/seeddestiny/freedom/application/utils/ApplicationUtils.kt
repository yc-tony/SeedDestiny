package com.seeddestiny.freedom.application.utils

import com.seeddestiny.freedom.application.model.Application

fun Application.getScopes(): Set<String> {
    return this@getScopes.oauthScopes?.split(",")?.map { it.trim() }?.toSet() ?: emptySet()
}

