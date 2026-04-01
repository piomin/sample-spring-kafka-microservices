FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

COPY base-domain base-domain
COPY order-service order-service

RUN apt-get update && apt-get install -y maven && \
    mvn -f base-domain/pom.xml install -DskipTests && \
    mvn -f order-service/pom.xml package -DskipTests && \
    apt-get remove -y maven && rm -rf /var/lib/apt/lists/*

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/order-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
