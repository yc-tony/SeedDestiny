package com.seeddestiny.freedom.account.repository

import com.seeddestiny.freedom.account.model.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AccountRepository : JpaRepository<Account, String> {
    fun findByUsername(username: String): Account?
    fun findByEmail(email: String): Account?
}
