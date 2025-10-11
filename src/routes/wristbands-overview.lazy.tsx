import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button';


// Interfaces e Enums baseados no Schema do Prisma
const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  PAID: 'PAID',
} as const;

type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

interface Product {
  id: string;
  name: string;
  price: string;
}

interface Wristband {
  id: string
  code: string
  qrCode: string
  isActive: boolean;
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: string
  orderId: string
  quantity: number
  unitPrice: string;
  totalPrice: string;
  createdAt: string
  updatedAt: string
  product: Product
}

interface Order {
  id: string
  wristbandId: string
  totalAmount: string;
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  status: OrderStatus;
}

interface WristbandWithDetails extends Wristband {
  orders: Order[];
}

export const Route = createLazyFileRoute('/wristbands-overview')({
  component: WristbandsOverview,
})

function WristbandsOverview () {
  const [selectedWristbandCode, setSelectedWristbandCode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'all'
  const queryClient = useQueryClient();

  const { data: wristbandsWithDetails, isLoading, error } = useQuery<WristbandWithDetails[], Error>({
    queryKey: ['wristbands-with-details'],
    queryFn: async () => {
      const wristbandsResponse = await api.get<Wristband[]>('/wristbands');
      if (!wristbandsResponse.data) return [];

      const detailedWristbands = await Promise.all(
        wristbandsResponse.data.map(async (wristband) => {
          try {
            const detailsResponse = await api.get<{ orders: Order[] }>(`/wristbands/${wristband.code}`);
            return { ...wristband, orders: detailsResponse.data.orders || [] };
          } catch (error) {
            console.error(`Failed to fetch details for wristband ${wristband.code}`, error);
            return { ...wristband, orders: [] };
          }
        })
      );
      return detailedWristbands;
    },
  });

  const deleteWristbandMutation = useMutation({
    mutationFn: (wristbandId: string) => api.delete(`/wristbands/${wristbandId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wristbands-with-details'] });
    },
  });

  const handleDelete = (wristbandId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mesa?')) {
      deleteWristbandMutation.mutate(wristbandId);
    }
  };

  const wristbandsWithUnpaidOrders = wristbandsWithDetails?.filter(
    (w) => w.isActive && w.orders.some((o) => o.status !== OrderStatus.PAID)
  );

  const activeWristbands = wristbandsWithDetails?.filter((w) => w.isActive);

  const selectedWristbandOrders = wristbandsWithDetails?.find(
    (w) => w.code === selectedWristbandCode
  )?.orders;

  if (isLoading) return <div className="p-6 text-dark-text-primary">Carregando mesas...</div>
  if (error) return <div className="p-6 text-red-500">Erro ao carregar mesas: {error.message}</div>

  return (
    <div className="p-6 bg-gray-900 text-white dark:bg-dark-bg-primary min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold dark:text-dark-text-primary">Consulta de Mesas</h1>
        <Button onClick={() => setViewMode(viewMode === 'pending' ? 'all' : 'pending')}>
          {viewMode === 'pending' ? 'Ver Todas as Mesas' : 'Ver Mesas com Pendências'}
        </Button>
      </div>

      {viewMode === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lista de Pulseiras */}
          <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Mesas com Pendências</h2>
            <ul className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6 space-y-3">
              {wristbandsWithUnpaidOrders?.map((wristband) => (
                <li
                  key={wristband.id}
                  className={`p-4 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedWristbandCode === wristband.code
                      ? 'bg-dark-accent text-green-700 shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-dark-text-primary'
                  }`}
                  onClick={() => setSelectedWristbandCode(wristband.code)}
                >
                  <p className="font-semibold text-lg">Código: {wristband.code}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Detalhes do Consumo da Pulseira Selecionada */}
          <div className='fixed top-28 right-6 w-2/5'>
            <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Consumo da Mesa Selecionada</h2>
            {selectedWristbandCode ? (
              <>
                {selectedWristbandOrders && (
                  (() => {
                    const pendingOrders = selectedWristbandOrders.filter(order => order.status !== OrderStatus.PAID);
                    const allItems = pendingOrders.flatMap(order => order.orderItems || []).filter(Boolean);
                    const grandTotal = pendingOrders.reduce((acc, order) => acc + parseFloat(order.totalAmount || '0'), 0);

                    return (
                      <Card className="bg-gray-800 border-gray-700 text-white">
                        <CardHeader>
                          <CardTitle className="text-2xl">Consumo Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <h3 className="text-lg font-semibold mb-4 text-gray-200">Itens Consumidos:</h3>
                          <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                            {allItems.length === 0 ? (
                              <div className="text-center py-10"><p className="text-gray-400">Nenhum item pendente de pagamento.</p></div>
                            ) : (
                              <ul className="space-y-3">
                                {allItems.map((item) => (
                                  <li key={item.id} className="flex justify-between items-center text-gray-300">
                                    <span>{item.quantity}x {item.product.name}</span>
                                    <span className="font-medium">R$ {parseFloat(item.unitPrice || '0').toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-4 bg-gray-800/50 p-6">
                          <div className="flex justify-between items-center text-2xl font-bold text-white">
                            <span>Total Pendente:</span>
                            <span>R$ {grandTotal.toFixed(2)}</span>
                          </div>
                        </CardFooter>
                        {grandTotal > 0 && (
                          <div className="mt-8 px-5 text-center flex gap-2">
                            <Link to="/close-bill/$code" params={{ code: selectedWristbandCode }}>
                              <Button className="p-4 text-md bg-green-600 hover:bg-green-700">Fechar conta</Button>
                            </Link>
                          </div>
                        )}
                      </Card>
                    )
                  })()
                )}
                {!isLoading && selectedWristbandCode && !selectedWristbandOrders?.some(order => order.status !== OrderStatus.PAID) && (
                   <div className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6">
                      <p className="text-gray-600 dark:text-dark-text-secondary">Nenhum consumo pendente para esta pulseira.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6 text-gray-600 dark:text-dark-text-secondary text-center text-lg">
                Selecione uma pulseira na lista ao lado para ver seu consumo.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen">
          <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Todas as Mesas</h2>
          <div className="max-h-[80vh] overflow-y-auto">
            <ul className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6 space-y-3">
              {activeWristbands?.map((wristband) => (
                <li 
                  key={wristband.id}
                  className="p-4 rounded-md flex justify-between items-center bg-gray-100 dark:bg-gray-700"
                >
                  <p className="font-semibold text-lg text-gray-900 dark:text-dark-text-primary">Código: {wristband.code}</p>
                  <Button
                    onClick={() => handleDelete(wristband.id)}
                    className="p-2 text-sm bg-red-600 hover:bg-red-700"
                    disabled={deleteWristbandMutation.isPending}
                  >
                    Excluir
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}