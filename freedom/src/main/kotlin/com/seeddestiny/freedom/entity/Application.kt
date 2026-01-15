package com.seeddestiny.freedom.entity

import jakarta.persistence.*
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

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Long = System.currentTimeMillis(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Long = System.currentTimeMillis()
)
