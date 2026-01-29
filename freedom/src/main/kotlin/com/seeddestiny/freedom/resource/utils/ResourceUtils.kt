package com.seeddestiny.freedom.resource.utils

import com.seeddestiny.freedom.common.utils.EnumJpaConverter
import com.seeddestiny.freedom.resource.model.MaterialFileType
import com.seeddestiny.freedom.resource.model.ResourceFileType
import jakarta.persistence.Converter

@Converter(autoApply = true)
class ResourceFileTypeJpaConverter : EnumJpaConverter<ResourceFileType>()

@Converter(autoApply = true)
class MaterialFileTypeJpaConverter : EnumJpaConverter<MaterialFileType>()