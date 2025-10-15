/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { IOrder } from '@/types'; // Assuming IOrder is defined in types

export const Route = createLazyFileRoute('/kitchen')({
  component: KitchenDisplay,
});

// Helper function to render order cards
const OrderCard = ({ order, onUpdateStatus }: { order: IOrder, onUpdateStatus: (status: 'PREPARING' | 'READY') => void }) => (
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

function KitchenDisplay() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<IOrder[]>([]);
  const [inProgress, setInProgress] = useState<IOrder[]>([]);

  // Fetch initial state of orders
  useEffect(() => {
    api.get('/orders').then(response => {
      const orders: IOrder[] = response.data;
      setPending(orders.filter(o => o.status === 'PENDING'));
      setInProgress(orders.filter(o => o.status === 'PREPARING'));
      // No longer setting 'done' orders
    });
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws/kitchen');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'NEW_ORDER') {
        const newOrder: IOrder = message.payload;
        // Add table and orderItems to the new order from the initial fetch
        api.get('/orders').then(response => {
            const orders: IOrder[] = response.data;
            const fullOrder = orders.find(o => o.id === newOrder.id);
            if (fullOrder) {
                setPending(prev => [fullOrder, ...prev]);
            }
        });
      }
    };

    ws.onclose = () => {
      console.log('Kitchen WebSocket disconnected');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: 'PREPARING' | 'READY' }) => {
      return api.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: (updatedOrder) => {
        const order = updatedOrder.data;
        if (order.status === 'PREPARING') {
            setPending(prev => prev.filter(o => o.id !== order.id));
            setInProgress(prev => [order, ...prev]);
        }
        if (order.status === 'READY') {
            // Just remove from inProgress, don't add to a 'done' column
            setInProgress(prev => prev.filter(o => o.id !== order.id));
        }
    }
  });

  const handleUpdateStatus = (orderId: string, status: 'PREPARING' | 'READY') => {
    updateStatusMutation.mutate({ orderId, status });
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Painel da Cozinha</h1>
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Column for PENDING orders */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-center text-red-400">A Fazer</h2>
          <div className="space-y-4">
            {pending.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={(status) => handleUpdateStatus(order.id, status)} />)}
          </div>
        </div>

        {/* Column for IN_PROGRESS orders */}
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
