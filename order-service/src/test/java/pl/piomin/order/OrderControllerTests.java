package pl.piomin.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import pl.piomin.base.domain.Order;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EmbeddedKafka(topics = {"orders"},
        partitions = 1,
        bootstrapServersProperty = "spring.kafka.bootstrap-servers")
public class OrderControllerTests {

    @Autowired
    TestRestTemplate restTemplate;
    @Autowired
    ObjectMapper mapper;
    @Autowired
    private KafkaTemplate<Long, Order> template;
    @Autowired
    private ConsumerFactory<Long, Order> factory;

    @Test
    void add() {
        Order o = new Order(1L, 1L, 1L, 10, 100);
        o = restTemplate.postForObject("/orders", o, Order.class);
        assertNotNull(o);
        assertEquals(1, o.getId());

        template.setConsumerFactory(factory);
        ConsumerRecord<Long, Order> rec = template.receive("orders", 0, 0, Duration.ofSeconds(5));
        assertNotNull(rec);
        assertNotNull(rec.value());
//        assertEquals(1, rec.value().getId());
    }
}
