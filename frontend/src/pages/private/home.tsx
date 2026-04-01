import { OrderCreateForm } from '@/components/order-create';
import { OrderList } from '@/components/order-list';

export function Home() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <OrderCreateForm />
      <OrderList />
    </div>
  );
}
