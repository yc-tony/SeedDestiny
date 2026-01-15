package com.seeddestiny.freedom.http.model

import com.fasterxml.jackson.annotation.JsonProperty

data class TokenRequest(
    @JsonProperty("grant_type")
    val grantType: String,

    val username: String?,

    val password: String?
)
