package com.seeddestiny.freedom.application.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.GenericGenerator
import org.hibernate.annotations.UpdateTimestamp
import java.io.Serializable
import java.time.LocalDateTime

@Entity
@Table(name = "application")
data class Application(
    @Id
    @GenericGenerator(name = "system-uuid", strategy = "uuid2")
    @GeneratedValue(generator = "system-uuid")
    @Column(name = "application_id", nullable = false, unique = true, length = 100)
    var id: String? = null,

    @Column(name = "name", nullable = false, length = 255)
    var name: String? = null,

    @Column(name = "password", nullable = false, length = 255)
    var password: String? = null,

    @Column(name = "grant_types", nullable = false, length = 500)
    var grantTypes: String? = null, // Comma-separated scopes

    @Column(name = "scopes", nullable = false, length = 500)
    var oauthScopes: String? = null, // Comma-separated scopes

    @Column(name = "access_expires", nullable = true, length = 100)
    var accessExpires: String? = null,

    @Column(name = "refresh_expires", nullable = true, length = 100)
    var refreshExpires: String? = null,

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    var createdDate: LocalDateTime? = null,

    @UpdateTimestamp
    @Column(name = "updated_date", nullable = false)
    var updatedDate: LocalDateTime? = null
) : Serializable