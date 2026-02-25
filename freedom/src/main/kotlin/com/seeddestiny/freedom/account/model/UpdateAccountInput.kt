package com.seeddestiny.freedom.account.model

import java.io.Serializable

class UpdateAccountInput (
    var accountId: String? = null,

    var phone: String? = null,


    var nickname: String? = null,

    var email: String? = null,

    var role: AccountRole? = null,
) : Serializable