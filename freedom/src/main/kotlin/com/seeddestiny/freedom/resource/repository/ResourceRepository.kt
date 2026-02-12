package com.seeddestiny.freedom.resource.repository

import com.seeddestiny.freedom.resource.model.Resource
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ResourceRepository : JpaRepository<Resource, String> {
    @Query("SELECT r.* FROM resource r " +
            "JOIN label_map lm ON r.id = lm.resource_id " +
            "WHERE lm.label_id IN (SELECT l.id FROM label l WHERE l.level = 0)", nativeQuery = true)
    fun findAllByLabelDisplay(): List<Resource>
}
