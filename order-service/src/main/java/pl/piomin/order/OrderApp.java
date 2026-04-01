package pl.piomin.order;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.common.serialization.Serializer;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.*;
import org.apache.kafka.streams.state.KeyValueBytesStoreSupplier;
import org.apache.kafka.streams.state.Stores;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.EnableKafkaStreams;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import pl.piomin.base.domain.Order;
import pl.piomin.order.service.OrderManageService;

import java.time.Duration;
import java.util.concurrent.Executor;

@SpringBootApplication
@EnableKafkaStreams
@EnableAsync
@SuppressWarnings("removal")
public class OrderApp {

    private static final Logger LOG = LoggerFactory.getLogger(OrderApp.class);

    public static void main(String[] args) {
        SpringApplication.run(OrderApp.class, args);
    }

    @Bean
    public NewTopic orders() {
        return TopicBuilder.name("orders")
                .partitions(3)
                .compact()
                .build();
    }

    @Bean
    public NewTopic paymentTopic() {
        return TopicBuilder.name("payment-orders")
                .partitions(3)
                .compact()
                .build();
    }

    @Bean
    public NewTopic stockTopic() {
        return TopicBuilder.name("stock-orders")
                .partitions(3)
                .compact()
                .build();
    }

    @Autowired
    OrderManageService orderManageService;

    @Bean
    @SuppressWarnings("removal")
    public KStream<Long, Order> stream(StreamsBuilder builder) {
        Serializer<Order> serializer = new org.springframework.kafka.support.serializer.JsonSerializer<>();
        Deserializer<Order> deserializer = new org.springframework.kafka.support.serializer.JsonDeserializer<>(Order.class);
        Serde<Order> orderSerde = Serdes.serdeFrom(serializer, deserializer);
        KStream<Long, Order> stream = builder
                .stream("payment-orders", Consumed.with(Serdes.Long(), orderSerde));

        stream.join(
                        builder.stream("stock-orders", Consumed.with(Serdes.Long(), orderSerde)),
                        orderManageService::confirm,
                        JoinWindows.ofTimeDifferenceWithNoGrace(Duration.ofSeconds(10)),
                        StreamJoined.with(Serdes.Long(), orderSerde, orderSerde))
                .peek((_, o) -> LOG.info("Output: {}", o))
                .to("orders", Produced.with(Serdes.Long(), orderSerde));

        return stream;
    }

    @Bean
    @SuppressWarnings("removal")
    public KTable<Long, Order> table(StreamsBuilder builder) {
        KeyValueBytesStoreSupplier store =
                Stores.persistentKeyValueStore("orders");
        Serializer<Order> serializer = new org.springframework.kafka.support.serializer.JsonSerializer<>();
        Deserializer<Order> deserializer = new org.springframework.kafka.support.serializer.JsonDeserializer<>(Order.class);
        Serde<Order> orderSerde = Serdes.serdeFrom(serializer, deserializer);
        KStream<Long, Order> stream = builder
                .stream("orders", Consumed.with(Serdes.Long(), orderSerde));
        return stream.toTable(Materialized.<Long, Order>as(store)
                .withKeySerde(Serdes.Long())
                .withValueSerde(orderSerde));
    }

    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(5);
        executor.setThreadNamePrefix("kafkaSender-");
        executor.initialize();
        return executor;
    }
}
