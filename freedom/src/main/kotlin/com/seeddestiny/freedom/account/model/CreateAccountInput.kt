package com.seeddestiny.freedom.account.model

import java.io.Serializable

data class CreateAccountInput(
    var username: String? = null,

    var password: String? = null,

    var phone: String? = null,

    var nickname: String? = null,

    var email: String? = null,

    var role: AccountRole? = null
): Serializable
