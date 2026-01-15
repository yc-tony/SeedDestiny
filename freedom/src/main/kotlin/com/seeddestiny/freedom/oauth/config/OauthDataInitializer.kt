package com.seeddestiny.freedom.oauth.config

import com.seeddestiny.freedom.account.model.Account
import com.seeddestiny.freedom.account.repository.AccountRepository
import com.seeddestiny.freedom.application.model.Application
import com.seeddestiny.freedom.application.repository.ApplicationRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

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

    private fun initializeApplication() {
        if (applicationRepository.count() > 0L) return

        val application = Application(
            name = "test",
            password = "test123",
            grantTypes = "password,refresh_token,client_credentials",
            oauthScopes = "public.*,private.*,admin.*"
        )

        applicationRepository.save(application)
    }

    private fun initializeAccount() {
        if (accountRepository.count() > 0L) return

        val adminAccount = Account(
            username = "admin",
            password = passwordEncoder.encode("admin123")
        )

        accountRepository.save(adminAccount)

    }
}