package com.seeddestiny.freedom.label.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "label",
    indexes = [
        Index(name = "idx_label_name", columnList = "name"),
        Index(name = "idx_label_level", columnList = "level")
    ]
)
data class Label(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "name", nullable = false, length = 255)
    var name: String? = null,

    /**
     * 標籤前端顯示等級，0代表顯示，1代表隱藏，數字未來可能會是階層，有設定決定要顯示的階層
     */
    @Column(name = "level", nullable = false, columnDefinition = "int default 1")
    var level: Int = 1,

    @Column(name = "created_date", nullable = false, updatable = false)
    @CreationTimestamp
    var createdDate: LocalDateTime? = null,

    @Column(name = "updated_date", nullable = false)
    @UpdateTimestamp
    var updatedDate: LocalDateTime? = null,
)
