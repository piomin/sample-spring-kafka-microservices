# Microservices with Spring Boot and Kafka Demo Project [![Twitter](https://img.shields.io/twitter/follow/piotr_minkowski.svg?style=social&logo=twitter&label=Follow%20Me)](https://twitter.com/piotr_minkowski)

## Articles
This repository is used as the example for the following articles:
1. [Distributed Transactions in Microservices with Kafka Streams and Spring Boot]() - how to implement distributed transaction based on the SAGA pattern with Spring Boot and Kafka Streams

## Description
There are three microservices:
`order-service` - it sends `Order` events to the Kafka topic and orchestrates the process of a distributed transaction
`payment-service` - it performs local transaction on the customer account basing on the `Order` price
`stock-service` - it performs local transaction on the store basing on number of products in the `Order`

