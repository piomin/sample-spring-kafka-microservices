package pl.piomin.payment.domain;

public class Reservation {
    private int amountAvailable;
    private int amountReserved;

    public Reservation() {
    }

    public Reservation(int amountAvailable) {
        this.amountAvailable = amountAvailable;
    }

    public int getAmountAvailable() {
        return amountAvailable;
    }

    public int getAmountReserved() {
        return amountReserved;
    }

    public void setAmountAvailable(int amountAvailable) {
        this.amountAvailable = amountAvailable;
    }

    public void setAmountReserved(int amountReserved) {
        this.amountReserved = amountReserved;
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "amountAvailable=" + amountAvailable +
                ", amountReserved=" + amountReserved +
                '}';
    }
}
