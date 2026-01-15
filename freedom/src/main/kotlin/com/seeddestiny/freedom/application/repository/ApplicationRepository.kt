package com.seeddestiny.freedom.application.repository

import com.seeddestiny.freedom.application.model.Application
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ApplicationRepository : JpaRepository<Application, String>