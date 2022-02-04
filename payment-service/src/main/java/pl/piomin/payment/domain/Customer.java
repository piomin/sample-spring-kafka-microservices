package pl.piomin.payment.domain;

import javax.persistence.*;
import javax.validation.constraints.Min;

@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String name;
    @Min(0)
    private int amountAvailable;
    private int amountReserved;

    public Customer() {
    }

    public Customer(Long id, String name, int amountAvailable, int amountReserved) {
        this.id = id;
        this.name = name;
        this.amountAvailable = amountAvailable;
        this.amountReserved = amountReserved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAmountAvailable() {
        return amountAvailable;
    }

    public void setAmountAvailable(int amountAvailable) {
        this.amountAvailable = amountAvailable;
    }

    public int getAmountReserved() {
        return amountReserved;
    }

    public void setAmountReserved(int amountReserved) {
        this.amountReserved = amountReserved;
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", amountAvailable=" + amountAvailable +
                ", amountReserved=" + amountReserved +
                '}';
    }
}
