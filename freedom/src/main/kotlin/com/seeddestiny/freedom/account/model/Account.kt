package com.seeddestiny.freedom.account.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.GenericGenerator
import org.hibernate.annotations.UpdateTimestamp
import java.io.Serializable
import java.time.LocalDateTime

@Entity
@Table(name = "account")
data class Account(
    @Id
    @GenericGenerator(name = "system-uuid", strategy = "uuid2")
    @GeneratedValue(generator = "system-uuid")
    @Column(name = "account_id", nullable = false, unique = true, length = 100)
    var id: String? = null,

    @Column(name = "username", nullable = false, unique = true, length = 100)
    var username: String? = null,

    @Column(name = "password", nullable = false, length = 255)
    var password: String? = null,

    @Column(name = "phone", nullable = true, length = 20)
    var phone: String? = null,

    @Column(name = "nickname", nullable = true, length = 100)
    var nickname: String? = null,

    @Column(name = "email", nullable = true, length = 255)
    var email: String? = null,

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    var createdDate: LocalDateTime? = null,

    @UpdateTimestamp
    @Column(name = "updated_date", nullable = false)
    var updatedDate: LocalDateTime? = null
) : Serializable