package com.seeddestiny.freedom.label.repository

import com.seeddestiny.freedom.label.model.LabelMap
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LabelMapRepository : JpaRepository<LabelMap, Long> {

    fun findByLabelIdAndChildLabelId(labelId: Long, childLabelId: Long): LabelMap?
}