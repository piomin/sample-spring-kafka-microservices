package pl.piomin.payment.repository;

import org.springframework.data.repository.CrudRepository;
import pl.piomin.payment.domain.Customer;

public interface CustomerRepository extends CrudRepository<Customer, Long> {
}
