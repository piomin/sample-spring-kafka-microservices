import { useEffect, useState } from 'react';
import type { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { orderService } from '@/apis/order-service';

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.list();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Orders</CardTitle>

        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div key={order.id} className="flex justify-between border p-2 rounded-md">
              <div>
                <div>ID: {order.id}</div>
                <div>Product: {order.productId}</div>
                <div>Qty: {order.quantity}</div>
              </div>

              <div className="font-semibold">{order.status}</div>
            </div>
          ))}

          {orders.length === 0 && <div className="text-sm text-muted-foreground">No orders yet</div>}
        </div>
      </CardContent>
    </Card>
  );
}
