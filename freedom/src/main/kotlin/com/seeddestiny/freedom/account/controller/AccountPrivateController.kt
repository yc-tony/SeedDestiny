package com.seeddestiny.freedom.account.controller

import com.seeddestiny.freedom.common.exception.ErrorCode
import com.seeddestiny.freedom.common.exception.SeedException
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/private/account")
@PreAuthorize("#oauth2.hasScope('private:account')")
@Validated
class AccountPrivateController {

    @GetMapping("/info")
    fun getAccountInfo(): Nothing {
        throw SeedException(ErrorCode(code = "account-0001", message = "Private account info"))
//        "Hello, private account!".asResponseOutput()
    }
}