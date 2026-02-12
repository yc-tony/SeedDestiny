package com.seeddestiny.freedom.resource.model

import com.seeddestiny.freedom.label.model.Label
import java.io.Serializable

data class ResourcePublicOutputs(
    var total: Int = 0,
    var records: List<ResourcePublicOutput> = emptyList()
) : Serializable

data class ResourcePublicOutput(
    var resourceId: String? = null,
    var title: String? = null,
    var resourceUrl: String? = null,
    var labels: List<LabelOutput>? = null,
    var materials: List<MaterialOutput>? = null,
) : Serializable

data class LabelOutput(
    var labelId: Long? = null,
    var name: String? = null
) : Serializable

data class MaterialOutput(
    var materialId: String? = null,
    var fileType: MaterialFileType? = null,
    var title: String? = null,
    var url: String? = null,
) : Serializable


fun Resource.asResourcePublicOutput(): ResourcePublicOutput {
    return ResourcePublicOutput(
        resourceId = this.id,
        title = this.title,
    )
}

fun Label.asLabelOutput(): LabelOutput {
    return LabelOutput(labelId = this.id, name = this.name)
}

fun Material.asMaterialOutput(): MaterialOutput {
    return MaterialOutput(materialId = this.id, fileType = this.fileType, title = this.title)
}