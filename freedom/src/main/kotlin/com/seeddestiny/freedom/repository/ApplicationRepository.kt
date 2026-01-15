package com.seeddestiny.freedom.repository

import com.seeddestiny.freedom.entity.Application
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ApplicationRepository : JpaRepository<Application, UUID> {
    fun findByApplicationId(applicationId: String): Application?
}
