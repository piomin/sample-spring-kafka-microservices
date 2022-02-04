package pl.piomin.stock;

import org.apache.kafka.common.serialization.Serdes;
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
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.serializer.JsonSerde;
import pl.piomin.base.domain.Order;
import pl.piomin.stock.domain.Reservation;
import pl.piomin.stock.service.OrderManageService;

import java.util.Random;

@SpringBootApplication
@EnableKafkaStreams
public class StockApp {

    private static final Logger LOG = LoggerFactory.getLogger(StockApp.class);

    public static void main(String[] args) {
        SpringApplication.run(StockApp.class, args);
    }

    @Autowired
    private KafkaTemplate<Long, Order> template;
    private Random random = new Random();

    @Bean
    public KStream<Long, Order> stream(StreamsBuilder builder) {
        JsonSerde<Order> orderSerde = new JsonSerde<>(Order.class);
        JsonSerde<Reservation> rsvSerde = new JsonSerde<>(Reservation.class);
        KStream<Long, Order> stream = builder
                .stream("orders", Consumed.with(Serdes.Long(), orderSerde))
                .peek((k, order) -> LOG.info("New: {}", order));

        KeyValueBytesStoreSupplier customerOrderStoreSupplier =
                Stores.persistentKeyValueStore("stock-orders");

        Aggregator<Long, Order, Reservation> aggrs = (id, order, rsv) -> {
            switch (order.getStatus()) {
                case "CONFIRMED" -> rsv.setItemsReserved(rsv.getItemsReserved() - order.getPrice());
                case "ROLLBACK" -> {
                    rsv.setItemsAvailable(rsv.getItemsAvailable() + order.getPrice());
                    rsv.setItemsReserved(rsv.getItemsReserved() - order.getPrice());
                }
                case "NEW" -> {
                    if (order.getPrice() <= rsv.getItemsAvailable()) {
                        rsv.setItemsAvailable(rsv.getItemsAvailable() - order.getPrice());
                        rsv.setItemsReserved(rsv.getItemsReserved() + order.getPrice());
                        order.setStatus("ACCEPT");
                    } else {
                        order.setStatus("REJECT");
                    }
                    template.send("stock-orders", order.getId(), order);
                }
            }
            LOG.info("{}", rsv);
            return rsv;
        };
        stream.selectKey((k, v) -> v.getProductId())
                .groupByKey(Grouped.with(Serdes.Long(), orderSerde))
                .aggregate(() -> new Reservation(random.nextInt(100)), aggrs,
                        Materialized.<Long, Reservation>as(customerOrderStoreSupplier)
                                .withKeySerde(Serdes.Long())
                                .withValueSerde(rsvSerde))
                .toStream()
                .peek((k, trx) -> LOG.info("Commit: {}", trx));

        return stream;
    }
}
