package pl.piomin.stock;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration
public class KafkaContainerDevMode {

    @Bean
    @ServiceConnection
    public KafkaContainer kafka() {
        return new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.4.0"))
                .withKraft()
                .withReuse(true);
    }

}
