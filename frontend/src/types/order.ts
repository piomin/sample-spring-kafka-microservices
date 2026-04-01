// types/order.ts
export type OrderStatus = 'NEW' | 'ACCEPT' | 'REJECT' | 'CONFIRMATION' | 'ROLLBACK' | 'CONFIRMED';

export interface Order {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  price: number;
  status: OrderStatus;
}

export interface CreateOrderRequest {
  customerId: number;
  productId: number;
  quantity: number;
  price: number;
}
