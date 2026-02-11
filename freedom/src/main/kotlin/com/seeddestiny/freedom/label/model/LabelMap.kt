package com.seeddestiny.freedom.label.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "label_map",
    indexes = [
        Index(name = "idx_label_map_label_id", columnList = "label_id"),
        Index(name = "idx_label_map_child_label_id", columnList = "child_label_id"),
        Index(name = "idx_label_map_resource_id", columnList = "resource_id")
    ]
)
data class LabelMap(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "label_id", nullable = false)
    var labelId: Long? = null,

    @Column(name = "child_label_id")
    var childLabelId: Long? = null,

    @Column(name = "resource_id", length = 128)
    var resourceId: String? = null,

    @Column(name = "created_date", nullable = false, updatable = false)
    @CreationTimestamp
    var createdDate: LocalDateTime? = null,

    @Column(name = "updated_date", nullable = false)
    @UpdateTimestamp
    var updatedDate: LocalDateTime? = null,
)
