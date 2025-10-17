/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Tipos de dados esperados da nova API /overview/sessions
interface ActiveSession {
  sessionId: string;
  tableNumber: number;
  tableId: string;
  totalConsumed: number;
  activeOrders: any[]; // Simplificado por enquanto
}

// Hook para buscar os dados do overview
const fetchOverview = async (): Promise<ActiveSession[]> => {
  const response = await api.get('/overview/sessions');
  return response.data;
};

export const Route = createLazyFileRoute('/overview')({
  component: OverviewComponent,
});

function OverviewComponent() {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);

  const { data: overviewData, isLoading, error } = useQuery<ActiveSession[], Error>({
    queryKey: ['overview-sessions'],
    queryFn: fetchOverview,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overview-sessions'] });
    },
    onError: (error: any) => {
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert('Ocorreu um erro ao cancelar o pedido.');
      }
    }
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este pedido? A cozinha será notificada.')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-white">Carregando painel...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erro ao carregar o painel: {error.message}</div>;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Painel de Controle de Mesas</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna da Lista de Mesas */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sessões Ativas</h2>
          <div className="space-y-4">
            {overviewData && overviewData.length > 0 ? (
              overviewData.map(session => (
                <Card 
                  key={session.sessionId} 
                  className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${selectedSession?.sessionId === session.sessionId ? 'border-blue-500' : ''}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-bold text-amber-400">Mesa {session.tableNumber}</CardTitle>
                    <div className="text-2xl font-bold text-emerald-400">R$ {session.totalConsumed.toFixed(2)}</div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p className="text-gray-400">Nenhuma sessão ativa no momento.</p>
            )}
          </div>
        </div>

        {/* Coluna de Detalhes da Mesa Selecionada */}
        <div className="sticky top-8 self-start">
          <h2 className="text-2xl font-semibold mb-4">Detalhes da Sessão</h2>
          {selectedSession ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-400">Mesa {selectedSession.tableNumber}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto text-white">
                <h3 className="text-lg font-semibold mb-4">Pedidos da Sessão:</h3>
                <div className="space-y-6">
                  {selectedSession.activeOrders.map((order: any) => (
                    <div key={order.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">Pedido #{order.id.substring(0, 8)}</p>
                          <p className={`text-sm font-semibold ${
                            order.status === 'PENDING' ? 'text-yellow-400' : 
                            order.status === 'PREPARING' ? 'text-blue-400' :
                            order.status === 'CANCELLED' ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            Status: {order.status}
                          </p>
                        </div>
                        <div title={order.status !== 'PENDING' ? 'Pedidos em preparo ou finalizados não podem ser cancelados.' : 'Cancelar o pedido inteiro'}>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={order.status !== 'PENDING'}
                          >
                            Cancelar Pedido
                          </Button>
                        </div>
                      </div>
                      <ul className="space-y-2 border-t border-gray-600 pt-3">
                        {order.orderItems.map((item: any) => (
                          <li key={item.id} className="flex justify-between items-center text-sm">
                            <p>{item.quantity}x {item.product.name}</p>
                            <p className="text-gray-400">R$ {Number(item.totalPrice).toFixed(2)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
              <p className="text-gray-500">Selecione uma sessão para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}