package pl.piomin.stock;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import pl.piomin.base.domain.Order;
import pl.piomin.stock.domain.Product;
import pl.piomin.stock.repository.ProductRepository;

import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = {"spring.kafka.consumer.auto-offset-reset=earliest"})
@EmbeddedKafka(topics = {"stock-orders"},
        partitions = 1,
        bootstrapServersProperty = "spring.kafka.bootstrap-servers")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class StockComponentTests {

    private static final Logger LOG = LoggerFactory.getLogger(StockComponentTests.class);

    static Product product;

    @Autowired
    private EmbeddedKafkaBroker kafka;
    @Autowired
    private KafkaTemplate<Long, Order> template;
    @Autowired
    private ConsumerFactory<Long, Order> factory;
    @Autowired
    ProductRepository repository;

    @Test
    @org.junit.jupiter.api.Order(1)
    void eventAccept() throws ExecutionException, InterruptedException, TimeoutException {
        Order o = new Order(1L, 1L, 1L, 10, 100);
        SendResult<Long, Order> r = template.send("orders", o.getId(), o)
                .get(1000, TimeUnit.MILLISECONDS);
        LOG.info("Sent: {}", r.getProducerRecord().value());

        template.setConsumerFactory(factory);
        ConsumerRecord<Long, Order> rec = template.receive("stock-orders", 0, 0, Duration.ofSeconds(5));
        assertNotNull(rec);
        assertNotNull(rec.value());
        assertEquals("ACCEPT", rec.value().getStatus());

        product = repository.findById(1L).orElseThrow();
    }

    @Test
    @org.junit.jupiter.api.Order(2)
    void eventReject() throws ExecutionException, InterruptedException, TimeoutException {
        Order o = new Order(2L, 2L, 2L, 1000, 1000);
        SendResult<Long, Order> r = template.send("orders", o.getId(), o)
                .get(1000, TimeUnit.MILLISECONDS);
        LOG.info("Sent: {}", r.getProducerRecord().value());

        template.setConsumerFactory(factory);
        ConsumerRecord<Long, Order> rec = template.receive("stock-orders", 0, 1, Duration.ofSeconds(5));
        assertNotNull(rec);
        assertNotNull(rec.value());
        assertEquals("REJECT", rec.value().getStatus());
    }

    @Test
    @org.junit.jupiter.api.Order(2)
    void eventConfirm() throws ExecutionException, InterruptedException, TimeoutException {
        Order o = new Order(1L, 1L, 1L, 10, 100);
        o.setStatus("CONFIRMED");
        SendResult<Long, Order> r = template.send("orders", o.getId(), o)
                .get(1000, TimeUnit.MILLISECONDS);
        LOG.info("Sent: {}", r.getProducerRecord().value());

        Thread.sleep(3000);
        Product p = repository.findById(1L).orElseThrow();
        assertEquals(product.getAvailableItems(), p.getAvailableItems());
        assertEquals(0, p.getReservedItems());
    }

}
