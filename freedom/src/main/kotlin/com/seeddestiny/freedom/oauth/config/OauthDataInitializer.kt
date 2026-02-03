package com.seeddestiny.freedom.oauth.config

import com.seeddestiny.freedom.account.model.Account
import com.seeddestiny.freedom.account.repository.AccountRepository
import com.seeddestiny.freedom.application.model.Application
import com.seeddestiny.freedom.application.repository.ApplicationRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

/**
 * OAuth2 測試資料初始化器
 * 在系統啟動時自動建立預設的 Application 與 Account 資料
 */
@Component
class OauthDataInitializer : CommandLineRunner {

    @Autowired
    private lateinit var applicationRepository: ApplicationRepository

    @Autowired
    private lateinit var accountRepository: AccountRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder


    override fun run(vararg args: String?) {
        initializeAccount()
        initializeApplication()
    }

    /**
     * 初始化預設應用程式 (Client)
     */
    private fun initializeApplication() {
        if (applicationRepository.count() > 0L) return

        val application = Application(
            id = "2d5171b5-3e7f-4b08-8ab6-06d586ecef87",
            name = "test",
            password = passwordEncoder.encode("test123"),
            grantTypes = "password,refresh_token,client_credentials",
            oauthScopes = "public.*,private.*,admin.*",
            accessExpires = "PT5M",
            refreshExpires = "PT10M"
        )

        applicationRepository.save(application)
    }

    /**
     * 初始化預設管理員帳號 (User)
     */
    private fun initializeAccount() {
        if (accountRepository.count() > 0L) return

        val adminAccount = Account(
            username = "admin",
            password = passwordEncoder.encode("admin123")
        )

        accountRepository.save(adminAccount)

    }
}