package com.seeddestiny.freedom.label.repository

import com.seeddestiny.freedom.label.model.Label
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface LabelRepository : JpaRepository<Label, Long> {

    @Query("SELECT l.* FROM label l WHERE l.level = 0", nativeQuery = true)
    fun findFirstLayerLabels(): List<Label>

    @Query(
        "SELECT cl.* FROM label l " +
                "JOIN label_map lm ON lm.label_id = l.id " +
                "JOIN label cl ON lm.child_label_id = cl.id " +
                "WHERE l.name = :parentLabelName", nativeQuery = true
    )
    fun findChildrenLabels(parentLabelName: String): List<Label>

    fun findByName(name: String): Optional<Label>
}