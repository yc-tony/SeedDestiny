package com.seeddestiny.freedom.common.utils

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import java.lang.reflect.ParameterizedType

/**
 * Base JPA converter for converting between Object and JSON String
 * Automatically converts objects to JSON string for database storage
 * and converts JSON string back to objects when reading from database
 *
 * Usage example:
 * ```
 * @Converter
 * class MyDataConverter : JsonJpaConverter<MyData>()
 *
 * @Entity
 * class MyEntity(
 *     @Convert(converter = MyDataConverter::class)
 *     @Column(columnDefinition = "TEXT")
 *     var data: MyData? = null
 * )
 * ```
 */
@Converter
abstract class JsonJpaConverter<T : Any> : AttributeConverter<T, String> {

    companion object {
        private val objectMapper: ObjectMapper = jacksonObjectMapper()
    }

    @Suppress("UNCHECKED_CAST")
    private val typeReference: TypeReference<T> = object : TypeReference<T>() {
        override fun getType() = (javaClass.genericSuperclass as ParameterizedType)
            .actualTypeArguments[0]
    }

    override fun convertToDatabaseColumn(attribute: T?): String? {
        if (attribute == null) {
            return null
        }
        return try {
            objectMapper.writeValueAsString(attribute)
        } catch (e: Exception) {
            throw IllegalArgumentException("Error converting object to JSON: ${e.message}", e)
        }
    }

    override fun convertToEntityAttribute(dbData: String?): T? {
        if (dbData.isNullOrBlank()) {
            return null
        }
        return try {
            objectMapper.readValue(dbData, typeReference)
        } catch (e: Exception) {
            throw IllegalArgumentException("Error converting JSON to object: ${e.message}", e)
        }
    }
}
