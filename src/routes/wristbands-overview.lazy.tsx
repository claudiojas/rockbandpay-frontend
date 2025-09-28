import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useState } from 'react'

interface Wristband {
  id: string
  code: string
  qrCode: string
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: string
  orderId: string
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
  product: {
    name: string
  }
}

interface Order {
  id: string
  wristbandId: string
  total: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export const Route = createLazyFileRoute('/wristbands-overview')({
  component: WristbandsOverview,
})

function WristbandsOverview () {
  const [selectedWristbandId, setSelectedWristbandId] = useState<string | null>(null)

  const { data: wristbands, isLoading: isLoadingWristbands, error: errorWristbands } = useQuery<Wristband[]> ({
    queryKey: ['wristbands'],
    queryFn: async () => {
      const response = await api.get('/wristbands')
      return response.data
    },
  })

  const { data: orders, isLoading: isLoadingOrders, error: errorOrders } = useQuery<Order[]> ({
    queryKey: ['orders', selectedWristbandId],
    queryFn: async () => {
      if (!selectedWristbandId) return []
      const response = await api.get(`/orders/${selectedWristbandId}`)
      return response.data
    },
    enabled: !!selectedWristbandId,
  })

  if (isLoadingWristbands) return <div className="p-6 text-dark-text-primary">Carregando pulseiras...</div>
  if (errorWristbands) return <div className="p-6 text-red-500">Erro ao carregar pulseiras: {errorWristbands.message}</div>

  return (
    <div className="p-6 bg-gray-900 text-white dark:bg-dark-bg-primary min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 dark:text-dark-text-primary">Consulta de Pulseiras</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lista de Pulseiras */}
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Todas as Pulseiras</h2>
          <ul className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6 space-y-3">
            {wristbands?.map((wristband) => (
              <li
                key={wristband.id}
                className={`p-4 rounded-md cursor-pointer transition-colors duration-200 ${
                  selectedWristbandId === wristband.id
                    ? 'bg-dark-accent text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-dark-text-primary'
                }`}
                onClick={() => setSelectedWristbandId(wristband.id)}
              >
                <p className="font-semibold text-lg">Código: {wristband.code}</p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">ID: {wristband.id}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Detalhes do Consumo da Pulseira Selecionada */}
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Consumo da Pulseira Selecionada</h2>
          {selectedWristbandId ? (
            <div className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6">
              {isLoadingOrders && <p className="text-dark-text-primary">Carregando consumo...</p>}
              {errorOrders && <p className="text-red-500">Erro ao carregar consumo: {errorOrders.message}</p>}
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="mb-6 p-5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <p className="font-bold text-xl mb-2 text-gray-800 dark:text-dark-text-primary">Pedido ID: {order.id}</p>
                    <p className="text-lg text-gray-700 dark:text-dark-text-secondary">Total do Pedido: <span className="font-semibold">R$ {order.total.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3">Data: {new Date(order.createdAt).toLocaleString()}</p>
                    <h3 className="font-bold text-lg mt-4 mb-2 text-gray-800 dark:text-dark-text-primary">Itens:</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-dark-text-secondary">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.product.name} - {item.quantity}x - <span className="font-semibold">R$ {item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                !isLoadingOrders && <p className="text-gray-600 dark:text-dark-text-secondary">Nenhum consumo registrado para esta pulseira.</p>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-bg-secondary shadow-xl rounded-lg p-6 text-gray-600 dark:text-dark-text-secondary text-center text-lg">
              Selecione uma pulseira na lista ao lado para ver seu consumo.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
