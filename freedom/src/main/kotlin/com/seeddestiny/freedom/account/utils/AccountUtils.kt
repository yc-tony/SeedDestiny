package com.seeddestiny.freedom.account.utils

import com.seeddestiny.freedom.account.model.AccountRole
import com.seeddestiny.freedom.common.utils.EnumJpaConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class AccountRoleJpaConverter : EnumJpaConverter<AccountRole>()