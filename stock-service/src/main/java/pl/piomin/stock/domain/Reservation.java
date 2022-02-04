package pl.piomin.stock.domain;

public class Reservation {
    private int itemsAvailable;
    private int itemsReserved;

    public Reservation() {
    }

    public Reservation(int itemsAvailable) {
        this.itemsAvailable = itemsAvailable;
    }

    public int getItemsAvailable() {
        return itemsAvailable;
    }

    public void setItemsAvailable(int itemsAvailable) {
        this.itemsAvailable = itemsAvailable;
    }

    public int getItemsReserved() {
        return itemsReserved;
    }

    public void setItemsReserved(int itemsReserved) {
        this.itemsReserved = itemsReserved;
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "itemsAvailable=" + itemsAvailable +
                ", itemsReserved=" + itemsReserved +
                '}';
    }
}
