package com.seeddestiny.freedom.label.controller

import com.seeddestiny.freedom.common.exception.SeedException
import com.seeddestiny.freedom.common.model.ApiResponseOutput
import com.seeddestiny.freedom.common.model.asResponseOutput
import com.seeddestiny.freedom.common.utils.logger
import com.seeddestiny.freedom.label.exception.LABEL_KEY_EXIST
import com.seeddestiny.freedom.label.exception.LABEL_NAME_IS_NULL
import com.seeddestiny.freedom.label.model.Label
import com.seeddestiny.freedom.label.model.LabelMap
import com.seeddestiny.freedom.label.repository.LabelMapRepository
import com.seeddestiny.freedom.label.repository.LabelRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin/label")
@PreAuthorize("#oauth2.hasScope('admin:label')")
@Validated
class LabelAdminController {
    private val logger = logger()

    @Autowired
    private lateinit var labelRepository: LabelRepository

    @Autowired
    private lateinit var labelMapRepository: LabelMapRepository


    @GetMapping("/all")
    fun getAllLabels(): ApiResponseOutput {
        return labelRepository.findAll().asResponseOutput()
    }

    @GetMapping("/nextLayers")
    fun getNextLayerLabels(@RequestParam labelKey: String?): ApiResponseOutput {
        return if (labelKey == null) {
            /**
             * 預設取得第一層標籤
             */
            labelRepository.findFirstLayerLabels().asResponseOutput()
        } else {
            /**
             * 取得子標籤
             */
            labelRepository.findChildrenLabels(labelKey).asResponseOutput()
        }
    }

    /**
     * 有 id 就更新，沒有就新增
     * label name 不能重複
     */
    @PostMapping("/createOrUpdate")
    fun updateLabel(@RequestBody label: Label): ApiResponseOutput {
        val name = label.name ?: throw SeedException(LABEL_NAME_IS_NULL)

        // 1. 先檢查名稱是否已存在
        val existingLabel = labelRepository.findByName(name).orElse(null)

        if (label.id != null && label.id!! > 0) {
            // === 更新流程 ===

            // 如果名稱存在，且該名稱不屬於當前正在更新的這個 ID，代表名稱衝突
            if (existingLabel != null && existingLabel.id != label.id) {
                throw SeedException(LABEL_KEY_EXIST, "labelKey" to name)
            }

            // TODO: 建議確認 saveAndFlush 行為。若 label 為部分資料，可能導致其他欄位遺失。
            // 安全做法是: val target = labelRepository.findById(label.id!!).get(); target.name = label.name; ...
            return labelRepository.saveAndFlush(label).asResponseOutput()
        } else {
            // === 新增流程 ===

            // 如果名稱已存在，直接拋出例外
            if (existingLabel != null) {
                throw SeedException(LABEL_KEY_EXIST, "labelKey" to name)
            }

            label.level = 0
            return labelRepository.saveAndFlush(label).asResponseOutput()
        }
    }

    @PostMapping("/linkChildren/{parentlabelid}")
    fun linkChildrenLabels(@PathVariable parentLabelId: Long, @RequestBody childLabelId: Long): ApiResponseOutput {
        labelMapRepository.findByLabelIdAndChildLabelId(parentLabelId, childLabelId)?.let {
            return ApiResponseOutput(data = it.id)
        }

        val map = LabelMap().apply {
            this.labelId = parentLabelId
            this.childLabelId = childLabelId
        }
        labelMapRepository.saveAndFlush(map)
        return ApiResponseOutput(data = map.id)

    }
}