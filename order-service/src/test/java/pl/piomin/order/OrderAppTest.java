package pl.piomin.order;

import org.springframework.boot.SpringApplication;

public class OrderAppTest {

    public static void main(String[] args) {
        SpringApplication.from(OrderApp::main)
                .with(KafkaContainerDevMode.class)
                .run(args);
    }

}
