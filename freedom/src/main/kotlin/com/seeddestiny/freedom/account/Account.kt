package com.seeddestiny.freedom.account.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
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

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    var createdDate: LocalDateTime? = null,

    @UpdateTimestamp
    @Column(name = "updated_date", nullable = false)
    var updatedDate: LocalDateTime? = null
)
