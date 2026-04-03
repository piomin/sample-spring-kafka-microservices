# Microservices with Spring Boot and Kafka Demo Project [![Twitter](https://img.shields.io/twitter/follow/piotr_minkowski.svg?style=social&logo=twitter&label=Follow%20Me)](https://twitter.com/piotr_minkowski)

[![CircleCI](https://circleci.com/gh/piomin/sample-spring-kafka-microservices.svg?style=svg)](https://circleci.com/gh/piomin/sample-spring-kafka-microservices)

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-black.svg)](https://sonarcloud.io/dashboard?id=piomin_sample-spring-kafka-microservices)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=piomin_sample-spring-kafka-microservices&metric=bugs)](https://sonarcloud.io/dashboard?id=piomin_sample-spring-kafka-microservices)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=piomin_sample-spring-kafka-microservices&metric=coverage)](https://sonarcloud.io/dashboard?id=piomin_sample-spring-kafka-microservices)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=piomin_sample-spring-kafka-microservices&metric=ncloc)](https://sonarcloud.io/dashboard?id=piomin_sample-spring-kafka-microservices)

## Articles
This repository is used as the example for the following articles:
1. [Distributed Transactions in Microservices with Kafka Streams and Spring Boot](https://piotrminkowski.com/2022/01/24/distributed-transactions-in-microservices-with-kafka-streams-and-spring-boot/) - how to implement distributed transaction based on the SAGA pattern with Spring Boot and Kafka Streams
2. [Deep Dive into Saga Transactions with Kafka Streams and Spring Boot](https://piotrminkowski.com/2022/02/07/deep-dive-into-saga-transactions-with-kafka-streams-and-spring-boot/) - how to implement distributed transaction based on the SAGA pattern with Spring Boot and fully Kafka Streams `KStream` and `KTable`. You need to switch to the [streams-full](https://github.com/piomin/sample-spring-kafka-microservices/tree/streams-full) branch.

## Description
There are three microservices: \
`order-service` - it sends `Order` events to the Kafka topic and orchestrates the process of a distributed transaction \
`payment-service` - it performs local transaction on the customer account basing on the `Order` price \
`stock-service` - it performs local transaction on the store basing on number of products in the `Order`

Here's the diagram with our architecture:

![image](https://raw.githubusercontent.com/piomin/sample-spring-kafka-microservices/master/arch.png)

(1) `order-service` send a new `Order` -> `status == NEW` \
(2) `payment-service` and `stock-service` receive `Order` and handle it by performing a local transaction on the data \
(3) `payment-service` and `stock-service` send a reponse `Order` -> `status == ACCEPT` or `status == REJECT` \
(4) `order-service` process incoming stream of orders from `payment-service` and `stock-service`, join them by `Order` id and sends Order with a new status -> `status == CONFIRMATION` or `status == ROLLBACK` or `status == REJECTED` \
(5) `payment-service` and `stock-service` receive `Order` with a final status and "commit" or "rollback" a local transaction make before

## Prerequisites
- **Java**: JDK 21 (set as Project SDK in your IDE)
- **Maven**: Latest version installed
- **Git**: For cloning the repository

## Running Locally (without Docker)
This is the best option for development and testing. You'll run Kafka locally and then start each microservice.

### Step 1: Download and Install Kafka

1. Download Kafka 3.8.0 from [Apache Kafka Downloads](https://kafka.apache.org/downloads)
2. Extract the archive to a folder, e.g., `C:\kafka`
3. Verify the installation by checking for `bin\windows\` and `config\` directories

### Step 2: Start Zookeeper
Zookeeper is required for Kafka to coordinate brokers and manage metadata.

1. Open **PowerShell** and navigate to your Kafka directory:
   ```powershell
   cd C:\kafka
   ```
2. Start Zookeeper:
   ```powershell
   .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
   ```
3. Keep this terminal open. You should see logs indicating Zookeeper is running on port 2181.

### Step 3: Start Kafka Server
In a **new PowerShell terminal**, navigate to your Kafka directory:
```powershell
cd C:\kafka
```

Start the Kafka broker:
```powershell
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

Keep this terminal open. You should see logs indicating Kafka is running on `localhost:9092`.

### Step 4: Clone and Build the Project

1. Clone the repository:
   ```powershell
   git clone https://github.com/piomin/sample-spring-kafka-microservices.git
   cd sample-spring-kafka-microservices
   ```

2. Build all modules (from the project root directory):
   ```powershell
   mvn clean install
   ```

### Step 5: Start Each Microservice
Open **three separate PowerShell terminals** from the project root directory:

**Terminal 1 - Start Order Service:**
```powershell
cd order-service
mvn spring-boot:run
```
The service will start on `http://localhost:8080`

**Terminal 2 - Start Payment Service:**
```powershell
cd payment-service
mvn spring-boot:run
```

**Terminal 3 - Start Stock Service:**
```powershell
cd stock-service
mvn spring-boot:run
```

All three services should connect to Kafka on `localhost:9092` and show startup logs without errors.

### Step 6: Test the Microservices

Once all services are running, you can test the APIs using **Postman**.

#### Using Postman (GUI)

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a **POST** request to `http://localhost:8080/orders` with JSON body:
   ```json
   {
     "customerId": 1,
     "productId": 1,
     "productCount": 2,
     "price": 100
   }
   ```
3. Create a **POST** request to `http://localhost:8080/orders/generate` (no body)
4. Create a **GET** request to `http://localhost:8080/orders`

#### Using Browser (for GET only)

Simply open your browser and navigate to:
```
http://localhost:8080/orders
```

### Expected Behavior

- When you create/generate an order, the `order-service` publishes an event to Kafka
- The `payment-service` and `stock-service` consume the order events and process local transactions
- The services send response events back to Kafka
- The `order-service` joins and aggregates responses to determine final order status (CONFIRMED, REJECTED, etc.)
- You can see logs in each terminal showing the event flow and processing

### Troubleshooting

- **Kafka connection error**: Ensure Zookeeper and Kafka are running on ports 2181 and 9092 respectively
- **Port already in use**: Check if another app is using port 8080 or 9092. Stop it or modify `server.port` in `application.yml`
- **ClassNotFoundException in stock-service**: Ensure `jackson-databind` dependency is uncommented in `stock-service/pom.xml`
- **Service startup issues**: Check logs in each terminal for detailed error messages

## Running on Docker locally
You can easily run all the apps on Docker with Spring Boot support for:
(a) Testcontainers
(b) Docker Compose

### (a) For Testcontainers
Go to the `order-service` directory and execute:
```shell
$ mvn clean spring-boot:test-run
```

Then go to the `payment-service` directory and execute:
```shell
$ mvn clean spring-boot:test-run
```

Finally go to the `stock-service` directory and execute:
```shell
$ mvn clean spring-boot:test-run
```

You will have three apps running with a single shared Kafka running on Testcontainers.

### (b) For Docker Compose
First build the whole project and images with the following command:
```shell
$ mvn clean package -DskipTests -Pbuild-image
```

Then, from the project root directory, start all services:
```shell
$ docker-compose up
```

You will have Kafka, order-service, payment-service, and stock-service running in Docker containers.
