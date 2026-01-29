package com.seeddestiny.freedom.common.utils

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import java.lang.reflect.ParameterizedType

/**
 * Base JPA converter for converting between Enum and String
 * Automatically converts enum values to their name (String) for database storage
 * and converts String back to enum values when reading from database
 */
@Converter
abstract class EnumJpaConverter<E : Enum<E>> : AttributeConverter<E, String> {

    @Suppress("UNCHECKED_CAST")
    private val enumClass: Class<E> = run {
        val type = javaClass.genericSuperclass as ParameterizedType
        type.actualTypeArguments[0] as Class<E>
    }

    override fun convertToDatabaseColumn(attribute: E?): String? {
        return attribute?.name
    }

    override fun convertToEntityAttribute(dbData: String?): E? {
        if (dbData == null) {
            return null
        }
        return enumClass.enumConstants.firstOrNull { it.name == dbData }
    }
}
