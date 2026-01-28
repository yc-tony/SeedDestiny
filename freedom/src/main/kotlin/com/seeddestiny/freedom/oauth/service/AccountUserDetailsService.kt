package com.seeddestiny.freedom.oauth.service

import com.seeddestiny.freedom.account.repository.AccountRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

/**
 * 自定義使用者詳情服務
 * 負責從資料庫中的 Account 表載入使用者資訊供 Spring Security 驗證
 */
@Service
class AccountUserDetailsService(
    private val accountRepository: AccountRepository
) : UserDetailsService {

    /**
     * 根據使用者名稱查詢使用者，並轉換為 Security 的 UserDetails 物件
     */
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
