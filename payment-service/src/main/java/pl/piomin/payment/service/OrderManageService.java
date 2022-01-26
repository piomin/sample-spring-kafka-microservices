package pl.piomin.payment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.piomin.base.domain.Order;
import pl.piomin.payment.domain.Customer;
import pl.piomin.payment.exception.ForceRollbackException;
import pl.piomin.payment.repository.CustomerRepository;

import java.util.Random;

@Service
public class OrderManageService {

    private static final Random RAND = new Random();
    private static final String SOURCE = "payment";
    private static final Logger LOG = LoggerFactory.getLogger(OrderManageService.class);
    private CustomerRepository repository;
    private KafkaTemplate<Long, Order> template;

    public OrderManageService(CustomerRepository repository, KafkaTemplate<Long, Order> template) {
        this.repository = repository;
        this.template = template;
    }

    @Transactional("transactionManager")
    public void reserve(Order order) {
        Customer customer = repository.findById(order.getCustomerId()).orElseThrow();
        LOG.info("Found: {}", customer);
        if (order.getPrice() < customer.getAmountAvailable()) {
            order.setStatus("ACCEPT");
            customer.setAmountReserved(customer.getAmountReserved() + order.getPrice());
            customer.setAmountAvailable(customer.getAmountAvailable() - order.getPrice());
        } else {
            order.setStatus("REJECTED");
        }
        order.setSource(SOURCE);

        int r = RAND.nextInt(3);
        switch (r) {
            case 0 -> LOG.info("Scenario: DB error");
            case 1 -> LOG.info("Scenario: Success");
            case 2 -> LOG.info("Scenario: Exception");
        }

        if (r == 0)
            customer.setName("Customer1");
        if (r == 1 || r == 2)
            repository.save(customer);
        template.send("payment-orders", order.getId(), order);
        LOG.info("Sent: {}", order);
        if (r == 2)
            throw new ForceRollbackException();
    }

    public void confirm(Order order) {
        Customer customer = repository.findById(order.getCustomerId()).orElseThrow();
        LOG.info("Found: {}", customer);
        if (order.getStatus().equals("CONFIRMED")) {
            customer.setAmountReserved(customer.getAmountReserved() - order.getPrice());
            repository.save(customer);
        } else if (order.getStatus().equals("ROLLBACK") && !order.getSource().equals(SOURCE)) {
            customer.setAmountReserved(customer.getAmountReserved() - order.getPrice());
            customer.setAmountAvailable(customer.getAmountAvailable() + order.getPrice());
            repository.save(customer);
        }

    }
}
