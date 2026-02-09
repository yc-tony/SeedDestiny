package com.seeddestiny.freedom.common.config

import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.ApplicationListener
import org.springframework.context.annotation.Profile
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import java.io.File
import java.net.URI
import java.nio.charset.StandardCharsets

@Component
@Profile("!prod") // 避免在生產環境執行
class OpenApiExportConfig(private val environment: Environment) : ApplicationListener<ApplicationReadyEvent> {

    override fun onApplicationEvent(event: ApplicationReadyEvent) {
        // 啟動一個新執行緒來執行，以免阻塞主執行緒
        Thread {
            try {
                // 等待幾秒鐘確保上下文完全初始化
                Thread.sleep(3000)

                val port = environment.getProperty("server.port", "8080")
                val contextPath = environment.getProperty("server.servlet.context-path", "")

                // 根據您的 application.yaml 設定，api-docs 路徑為 /api-docs
                // 所以 YAML 文件的路徑應該是 /api-docs.yaml
                val apiUrl = "http://localhost:$port$contextPath/api-docs.yaml"

                println("正在嘗試從 $apiUrl 下載 OpenAPI 文件...")

                val url = URI(apiUrl).toURL()
                val yamlContent = url.readText(StandardCharsets.UTF_8)

                // 寫入到專案根目錄 (這裡是相對於執行目錄，通常是專案根目錄)
                val file = File("openapi.yaml")
                file.writeText(yamlContent, StandardCharsets.UTF_8)

                println("OpenAPI 文件已成功匯出至: ${file.absolutePath}")
            } catch (e: Exception) {
                println("匯出 OpenAPI 文件失敗: ${e.message}")
                // e.printStackTrace() // 如果需要詳細錯誤訊息可取消註解
            }
        }.start()
    }
}
