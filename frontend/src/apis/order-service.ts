// services/orderService.ts
import type { CreateOrderRequest, Order } from '@/types/order';

const BASE_URL = process.env.BASE_URL;

export const orderService = {
  async create(payload: CreateOrderRequest): Promise<void> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Order create failed');
    }
  },

  async list(): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/orders`);

    if (!res.ok) {
      throw new Error('Order list failed');
    }

    return res.json();
  }
};
