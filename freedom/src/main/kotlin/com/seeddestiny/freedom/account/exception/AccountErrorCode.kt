package com.seeddestiny.freedom.account.exception

import com.seeddestiny.freedom.common.exception.ErrorCode
import org.springframework.http.HttpStatus

val ACCOUNT_NOT_FOUND = ErrorCode(HttpStatus.NOT_FOUND, "account-0001", "Account not found: %{accountId}")
val USERNAME_REQUIRED = ErrorCode(HttpStatus.BAD_REQUEST, "account-0002", "Username is required")
val PASSWORD_REQUIRED = ErrorCode(HttpStatus.BAD_REQUEST, "account-0003", "Password is required")
val USERNAME_DUPLICATE = ErrorCode(HttpStatus.BAD_REQUEST, "account-0004", "Username already exists: %{username}")
val EMAIL_INVALID = ErrorCode(HttpStatus.BAD_REQUEST, "account-0005", "Invalid email format: %{email}")
val EMAIL_DUPLICATE = ErrorCode(HttpStatus.BAD_REQUEST, "account-0006", "Email already exists: %{email}")
val PHONE_INVALID = ErrorCode(HttpStatus.BAD_REQUEST, "account-0007", "Invalid phone format (Taiwan format required): %{phone}")
val ACCOUNT_ID_REQUIRED = ErrorCode(HttpStatus.BAD_REQUEST, "account-0008", "Account ID is required")
val PASSWORD_INVALID = ErrorCode(HttpStatus.BAD_REQUEST, "account-0009", "Password must be at least 6 characters long")
val OLD_PASSWORD_REQUIRED = ErrorCode(HttpStatus.BAD_REQUEST, "account-0010", "Old password is required")
val OLD_PASSWORD_INCORRECT = ErrorCode(HttpStatus.BAD_REQUEST, "account-0012", "Old password is incorrect")