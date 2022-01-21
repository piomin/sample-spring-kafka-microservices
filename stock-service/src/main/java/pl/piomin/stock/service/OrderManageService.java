package pl.piomin.stock.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import pl.piomin.base.domain.Order;
import pl.piomin.stock.domain.Product;
import pl.piomin.stock.repository.ProductRepository;

@Service
public class OrderManageService {

    private static final String SOURCE = "stock";
    private static final Logger LOG = LoggerFactory.getLogger(OrderManageService.class);
    private ProductRepository repository;
    private KafkaTemplate<Long, Order> template;

    public OrderManageService(ProductRepository repository, KafkaTemplate<Long, Order> template) {
        this.repository = repository;
        this.template = template;
    }

    public void reserve(Order order) {
        Product product = repository.findById(order.getProductId()).orElseThrow();
        LOG.info("Found: {}", product);
        if (order.getStatus().equals("NEW")) {
            if (order.getProductCount() < product.getAvailableItems()) {
                product.setReservedItems(product.getReservedItems() + order.getProductCount());
                product.setAvailableItems(product.getAvailableItems() - order.getProductCount());
                order.setStatus("ACCEPT");
                repository.save(product);
            } else {
                order.setStatus("REJECT");
            }
            template.send("stock-orders", order.getId(), order);
            LOG.info("Sent: {}", order);
        }
    }

    public void confirm(Order order) {
        Product product = repository.findById(order.getProductId()).orElseThrow();
        LOG.info("Found: {}", product);
        if (order.getStatus().equals("CONFIRMED")) {
            product.setReservedItems(product.getReservedItems() - order.getProductCount());
            repository.save(product);
        } else if (order.getStatus().equals("ROLLBACK") && !order.getSource().equals(SOURCE)) {
            product.setReservedItems(product.getReservedItems() - order.getProductCount());
            product.setAvailableItems(product.getAvailableItems() + order.getProductCount());
            repository.save(product);
        }
    }

}
