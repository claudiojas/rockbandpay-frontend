/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useOrdersByStatus } from '../hooks/useOrdersByStatus';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createLazyFileRoute('/waiter-monitor')({
  component: WaiterMonitor,
});

function WaiterMonitor() {
  const queryClient = useQueryClient();
  const { data: readyOrders, isLoading, error } = useOrdersByStatus('READY');

  const deliverOrderMutation = useMutation({
    mutationFn: (orderId: string) => {
      return api.patch(`/orders/${orderId}/status`, { status: 'DELIVERED' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'READY'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-white">Carregando pedidos prontos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro ao carregar pedidos: {error.message}</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Monitor do Garçom - Pedidos Prontos</h1>
        {readyOrders && readyOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {readyOrders.map(order => (
              <Card key={order.id} className="bg-gray-800 border-green-500/50 border-2 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Mesa: {order.table?.tableNumber || 'N/A'}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <ul>
                    {order.orderItems?.map(item => (
                      <li key={item.id}>{item.quantity}x {item.product.name}</li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-4 border-t border-gray-700">
                  <Button 
                    onClick={() => deliverOrderMutation.mutate(order.id)}
                    disabled={deliverOrderMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {deliverOrderMutation.isPending ? 'Marcando...' : 'Marcar como Entregue'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xl">Nenhum pedido pronto para entrega no momento.</p>
        )}
      </div>
    </div>
  );
}
