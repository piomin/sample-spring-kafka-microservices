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

## Running on Docker locally
You can easily run all the apps on Docker with Spring Boot support for
(a) Testcontainers
(b) Docker Compose

(a) For Testcontainers
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

(b) For Docker Compose
First build the whole project and images with the following command:
```shell
$ mvn clean package -DskipTests -Pbuild-image
```

Then, you can go to the one of available directories: `order-service`, `payment-service` or `stock-service` and execute:
```shell
$ mvn spring-boot:run
```

You start your app and have Kafka and two other containers started with Docker Compose.