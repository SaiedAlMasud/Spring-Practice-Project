FROM eclipse-temurin:26-jre

WORKDIR /app

COPY build/libs/internal-announcements-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]