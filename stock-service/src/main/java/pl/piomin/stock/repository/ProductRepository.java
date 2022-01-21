package pl.piomin.stock.repository;

import org.springframework.data.repository.CrudRepository;
import pl.piomin.stock.domain.Product;

public interface ProductRepository extends CrudRepository<Product, Long> {
}
