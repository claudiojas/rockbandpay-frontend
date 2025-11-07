import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { IOrder } from '@/types';
import { useOrdersByStatus } from '../hooks/useOrdersByStatus';

export const Route = createLazyFileRoute('/kitchen')({
  component: KitchenDisplay,
});

const OrderCard = ({ order, onUpdateStatus }: { order: IOrder, onUpdateStatus: (status: 'PREPARING' | 'READY') => void }) => {
  if (order.status === 'CANCELLED') {
    return (
      <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 space-y-3 opacity-60">
        <h4 className="font-bold text-lg line-through">Mesa: {order.table?.tableNumber || 'N/A'}</h4>
        <p className="text-center font-extrabold text-2xl text-white">CANCELADO</p>
        <ul className="space-y-1 text-sm line-through">
          {order.orderItems.map(item => (
            <li key={item.id}>{item.quantity}x {item.product.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
      <h4 className="font-bold text-lg">Mesa: {order.table?.tableNumber || 'N/A'}</h4>
      <ul className="space-y-1 text-sm">
        {order.orderItems.map(item => (
          <li key={item.id}>{item.quantity}x {item.product.name}</li>
        ))}
      </ul>
      <div className="flex gap-2 pt-2">
        {order.status === 'PENDING' && (
          <button onClick={() => onUpdateStatus('PREPARING')} className="w-full p-2 text-sm bg-blue-600 hover:bg-blue-700 rounded">
            Iniciar Preparo
          </button>
        )}
        {order.status === 'PREPARING' && (
          <button onClick={() => onUpdateStatus('READY')} className="w-full p-2 text-sm bg-green-600 hover:bg-green-700 rounded">
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
};

function KitchenDisplay() {
  const queryClient = useQueryClient();

  const { data: pendingOrders } = useOrdersByStatus('PENDING');
  const { data: preparingOrders } = useOrdersByStatus('PREPARING');
  const { data: cancelledOrders } = useOrdersByStatus('CANCELLED');

  // WebSocket connection for real-time invalidation
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws = new WebSocket(`ws://${window.location.host}/ws/kitchen`);

      ws.onopen = () => {
      };

      ws.onmessage = (event) => {
        const parsedMessage = JSON.parse(event.data);
        if (parsedMessage.type === 'NEW_ORDER' || parsedMessage.type === 'UPDATE_ORDER') {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      };

      ws.onclose = () => {
        console.log('Kitchen WebSocket disconnected, attempting to reconnect in 3 seconds...');
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('Kitchen WebSocket error:', error);
        ws?.close(); // This will trigger onclose and the reconnect logic
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnect logic from firing on manual close
        ws.close();
      }
    };
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: 'PREPARING' | 'READY' }) => {
      return api.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate queries on success to reflect the change immediately
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleUpdateStatus = (orderId: string, status: 'PREPARING' | 'READY') => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const pending = [...(pendingOrders || []), ...(cancelledOrders || [])]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
  const inProgress = (preparingOrders || [])
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Painel da Cozinha</h1>
      <div className="grid grid-cols-2 gap-6 items-start">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-center text-red-400">A Fazer</h2>
          <div className="space-y-4">
            {pending.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={(status) => handleUpdateStatus(order.id, status)} />)}
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-center text-yellow-400">Em Preparo</h2>
          <div className="space-y-4">
            {inProgress.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={(status) => handleUpdateStatus(order.id, status)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
