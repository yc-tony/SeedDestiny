package com.seeddestiny.freedom.resource.repository

import com.seeddestiny.freedom.resource.model.Material
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MaterialRepository : JpaRepository<Material, String> {

    fun findAllByReferenceId(referenceId: String): List<Material>
}
