package com.seeddestiny.freedom

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class FreedomApplication

fun main(args: Array<String>) {
	runApplication<FreedomApplication>(*args)
}
