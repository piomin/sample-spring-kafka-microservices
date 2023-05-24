package pl.piomin.stock;

import org.springframework.boot.SpringApplication;

public class StockAppTest {

    public static void main(String[] args) {
        SpringApplication.from(StockApp::main)
                .with(KafkaContainerDevMode.class)
                .run(args);
    }

}
