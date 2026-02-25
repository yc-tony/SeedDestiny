package com.seeddestiny.freedom.account.controller

import com.seeddestiny.freedom.account.exception.*
import com.seeddestiny.freedom.account.model.*
import com.seeddestiny.freedom.account.repository.AccountRepository
import com.seeddestiny.freedom.common.exception.SeedException
import com.seeddestiny.freedom.common.utils.isValidEmail
import com.seeddestiny.freedom.common.utils.isValidPassword
import com.seeddestiny.freedom.common.utils.isValidTaiwanPhone
import com.seeddestiny.freedom.common.utils.logger
import com.seeddestiny.freedom.oauth.utils.getAccountId
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/admin/account")
@PreAuthorize("#oauth2.hasScope('admin:account')")
@Validated
class AccountAdminController {
    private val log = logger()

    @Autowired
    private lateinit var accountRepository: AccountRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @PostMapping("/create")
    fun createAccount(@RequestBody input: CreateAccountInput): Account {
        log.info("Create account input: {}", input)
        // 1. 先檢查資料， username 和 password 一定要有值
        if (input.username.isNullOrBlank()) {
            throw SeedException(USERNAME_REQUIRED)
        }
        if (input.password.isNullOrBlank()) {
            throw SeedException(PASSWORD_REQUIRED)
        }

        // 2. username 不能有重複
        accountRepository.findByUsername(input.username!!)?.let {
            throw SeedException(USERNAME_DUPLICATE, "username" to input.username!!)
        }

        // 3. input 有帶 email 檢查 email 格式，以及DB 不能有重複的 email
        input.email?.let { email ->
            if (email.isNotBlank()) {
                if (!isValidEmail(email)) {
                    throw SeedException(EMAIL_INVALID, "email" to email)
                }
                accountRepository.findByEmail(email)?.let {
                    throw SeedException(EMAIL_DUPLICATE, "email" to email)
                }
            }
        }

        // 5. 檢查電話號碼，台灣 09 的格式
        input.phone?.let { phone ->
            if (phone.isNotBlank() && !isValidTaiwanPhone(phone)) {
                throw SeedException(PHONE_INVALID, "phone" to phone)
            }
        }

        // 檢查密碼格式
        if (input.password!!.length < 6) {
            throw SeedException(PASSWORD_INVALID)
        }

        // 4. 如果 role 沒有帶入，預設為 MEMBER
        val role = input.role ?: AccountRole.MEMBER

        val account = Account(
            username = input.username,
            password = passwordEncoder.encode(input.password),
            phone = input.phone?.takeIf { it.isNotBlank() },
            nickname = input.nickname?.takeIf { it.isNotBlank() },
            email = input.email?.takeIf { it.isNotBlank() },
            role = role
        )

        return accountRepository.save(account)
    }

    @PostMapping("/update/profile")
    fun updateAccount(@RequestBody input: UpdateAccountInput): Account {
        log.info("Update account input: {}", input)

        // 1. 先檢查資料， account id 一定要有值
        if (input.accountId.isNullOrBlank()) {
            throw SeedException(ACCOUNT_ID_REQUIRED)
        }

        val account = accountRepository.findById(input.accountId!!).orElseThrow {
            SeedException(ACCOUNT_NOT_FOUND, "accountId" to input.accountId!!)
        }

        // 2. 檢查電話號碼，台灣 09 的格式
        input.phone?.let { phone ->
            if (phone.isNotBlank() && !isValidTaiwanPhone(phone)) {
                throw SeedException(PHONE_INVALID, "phone" to phone)
            }
        }

        // 3. input 有帶 email 檢查 email 格式，以及DB 不能有重複的 email，若是原 email 不變則不檢查
        input.email?.let { email ->
            if (email.isNotBlank()) {
                if (!isValidEmail(email)) {
                    throw SeedException(EMAIL_INVALID, "email" to email)
                }
                // 若是原 email 不變則不檢查
                if (email != account.email) {
                    accountRepository.findByEmail(email)?.let {
                        throw SeedException(EMAIL_DUPLICATE, "email" to email)
                    }
                }
            }
        }

        // 4. 如果 role 沒有帶入，預設為 MEMBER
        val role = input.role ?: AccountRole.MEMBER

        // 更新帳號資料
        account.phone = input.phone?.takeIf { it.isNotBlank() }
        account.nickname = input.nickname?.takeIf { it.isNotBlank() }
        account.email = input.email?.takeIf { it.isNotBlank() }
        account.role = role

        return accountRepository.save(account)
    }

    @PostMapping("/update/password")
    fun updatePassword(@RequestBody input: UpdatePasswordInput): Account {
        val updateAccountId = getAccountId()
        val updateAccount = accountRepository.findById(updateAccountId).orElseThrow {
            SeedException(ACCOUNT_NOT_FOUND, "accountId" to updateAccountId)
        }


        // 3. 檢查新密碼是否符合規定
        isValidPassword(input.newPassword)

        // 2. 檢查舊密碼是否正確，如果 updateAccount.role 的身份是 ADMIN 就不用檢查舊的密碼
        if (updateAccount.role != AccountRole.ADMIN) {
            if (input.oldPassword.isNullOrBlank()) {
                throw SeedException(OLD_PASSWORD_REQUIRED)
            }
            if (!passwordEncoder.matches(input.oldPassword, updateAccount.password)) {
                throw SeedException(OLD_PASSWORD_INCORRECT)
            }
        }

        // 更新密碼
        updateAccount.password = passwordEncoder.encode(input.newPassword)

        return accountRepository.save(updateAccount)
    }
}