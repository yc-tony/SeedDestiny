package com.seeddestiny.freedom.account.repository

import com.seeddestiny.freedom.account.model.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AccountRepository : JpaRepository<Account, UUID> {
    fun findByUsername(username: String): Account?
}
