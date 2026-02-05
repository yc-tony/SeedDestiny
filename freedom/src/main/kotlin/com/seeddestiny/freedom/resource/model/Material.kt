package com.seeddestiny.freedom.resource.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.GenericGenerator
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "material",
    indexes = [Index(name = "idx_material_file_type", columnList = "file_type")]
)
data class Material(
    @Id
    @GenericGenerator(name = "system-uuid", strategy = "uuid2")
    @GeneratedValue(generator = "system-uuid")
    @Column(name = "id", nullable = false, unique = true, length = 100)
    var id: String? = null,

    @Column(name = "reference_id", length = 100)
    var referenceId: String? = null,

    @Column(name = "title", length = 255)
    var title: String? = null,

    @Column(name = "file_type", nullable = false, length = 20)
    var fileType: MaterialFileType? = null,

    @Column(name = "file_path", length = 1024)
    var filePath: String? = null,

    @Column(name = "display_poster", length = 1024)
    var displayPoster: String? = null,

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    var createdDate: LocalDateTime? = null,

    @UpdateTimestamp
    @Column(name = "updated_date", nullable = false)
    var updatedDate: LocalDateTime? = null
)
