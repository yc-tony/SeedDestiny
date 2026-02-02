package com.seeddestiny.freedom.resource.config

import lombok.Data
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties(prefix = "seed.resource")
@Data
@Component
data class ResourceProperties (
    var uploadFilePath: String = "./"
)