package com.seeddestiny.freedom.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "account")
class Account(
    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    var id: UUID = UUID.randomUUID(),

    @Column(name = "username", nullable = false, unique = true, length = 100)
    var username: String,

    @Column(name = "password", nullable = false, length = 255)
    var password: String,

    @Column(name = "phone", nullable = true, length = 20)
    var phone: String?,

    @Column(name = "nickname", nullable = true, length = 100)
    var nickname: String?,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Long = System.currentTimeMillis(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Long = System.currentTimeMillis()
)
