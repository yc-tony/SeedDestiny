package com.seeddestiny.freedom.repository

import com.seeddestiny.freedom.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AccountRepository : JpaRepository<Account, UUID> {
    fun findByUsername(username: String): Account?
}
