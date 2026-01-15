package com.seeddestiny.freedom.account.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "application")
class Application(
    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    var id: UUID = UUID.randomUUID(),

    @Column(name = "application_id", nullable = false, unique = true, length = 100)
    var applicationId: String,

    @Column(name = "password", nullable = false, length = 255)
    var password: String,

    @Column(name = "oauth_scopes", nullable = false, length = 500)
    var oauthScopes: String, // Comma-separated scopes

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    var createdDate: LocalDateTime? = null,

    @UpdateTimestamp
    @Column(name = "updated_date", nullable = false)
    var updatedDate: LocalDateTime? = null
)
