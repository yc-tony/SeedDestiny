package com.seeddestiny.freedom.service

import com.seeddestiny.freedom.account.repository.AccountRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class AccountUserDetailsService(
    private val accountRepository: AccountRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val account = accountRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found: $username")

        return User.builder()
            .username(account.username)
            .password(account.password)
            .authorities(emptyList())
            .build()
    }
}
