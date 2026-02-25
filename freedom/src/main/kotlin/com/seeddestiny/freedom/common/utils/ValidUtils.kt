package com.seeddestiny.freedom.common.utils

import com.seeddestiny.freedom.account.exception.PASSWORD_INVALID
import com.seeddestiny.freedom.account.exception.PASSWORD_REQUIRED
import com.seeddestiny.freedom.common.exception.SeedException

fun isValidEmail(email: String): Boolean {
    val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()
    return emailRegex.matches(email)
}

fun isValidTaiwanPhone(phone: String): Boolean {
    val phoneRegex = "^09\\d{8}$".toRegex()
    return phoneRegex.matches(phone)
}

fun isValidPassword(password: String?, enabledException: Boolean = true): Boolean {
    if (password.isNullOrBlank()) {
        if (enabledException) throw SeedException(PASSWORD_REQUIRED)
        return false
    }
    if (password.length < 6) {
        if (enabledException) throw SeedException(PASSWORD_INVALID)
        return false
    }
    return true
}