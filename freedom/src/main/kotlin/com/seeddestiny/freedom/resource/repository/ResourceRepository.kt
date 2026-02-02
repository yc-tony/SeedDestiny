package com.seeddestiny.freedom.resource.repository

import com.seeddestiny.freedom.resource.model.Resource
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ResourceRepository : JpaRepository<Resource, String>
