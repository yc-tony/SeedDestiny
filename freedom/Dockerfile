# 多階段構建 - 第一階段：構建應用程式
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

# 複製 Gradle 配置文件
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# 下載依賴（利用 Docker 緩存層）
RUN gradle dependencies --no-daemon || true

# 複製源代碼
COPY src ./src

# 構建應用程式
RUN gradle bootJar --no-daemon

# 第二階段：運行應用程式
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 創建非 root 用戶
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 從構建階段複製 JAR 文件
COPY --from=builder /app/build/libs/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 設置 JVM 參數
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# 啟動應用程式
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
