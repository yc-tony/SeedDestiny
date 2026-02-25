package com.seeddestiny.freedom.account.model

import java.io.Serializable

data class UpdatePasswordInput(
    var accountId: String? = null,

    var oldPassword: String? = null,

    var newPassword: String? = null,
) : Serializable
