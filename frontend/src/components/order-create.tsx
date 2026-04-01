// components/order-create-form.tsx
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateOrderRequest } from '@/types/order';
import { orderService } from '@/apis/order-service';

export function OrderCreateForm() {
  const { register, handleSubmit, reset, formState } = useForm<CreateOrderRequest>();

  const onSubmit = async (data: CreateOrderRequest) => {
    try {
      await orderService.create(data);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Order</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input type="number" placeholder="Customer ID" {...register('customerId', { valueAsNumber: true })} />

          <Input type="number" placeholder="Product ID" {...register('productId', { valueAsNumber: true })} />

          <Input type="number" placeholder="Quantity" {...register('quantity', { valueAsNumber: true })} />

          <Input type="number" step="any" placeholder="Price" {...register('price', { valueAsNumber: true })} />

          <Button type="submit" disabled={formState.isSubmitting}>
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
