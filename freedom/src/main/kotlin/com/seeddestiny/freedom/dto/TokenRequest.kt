package com.seeddestiny.freedom.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class TokenRequest(
    @JsonProperty("grant_type")
    val grantType: String,

    val username: String?,

    val password: String?
)
