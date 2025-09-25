import { Button } from '@/components/ui/button';

// Interfaces should ideally be in a central file (e.g., src/interfaces/Order.ts)
type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

interface IOrder {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
}

interface OrderHistoryModalProps {
  orders: IOrder[];
  onClose: () => void;
  wristbandCode: string;
}

export function OrderHistoryModal({ orders, onClose, wristbandCode }: OrderHistoryModalProps) {
  const grandTotal = orders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2">Histórico de Pedidos</h2>
        <p className="text-lg text-amber-400 mb-6">{wristbandCode}</p>

        <div className="max-h-96 overflow-y-auto pr-3 space-y-4 mb-6">
          {orders.length > 0 ? (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="flex justify-between items-center text-gray-300 bg-gray-700/50 p-4 rounded-md">
                  <div>
                    <p className="font-semibold">Pedido #{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-400">
                      R$ {parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                    <p className="text-sm capitalize">
                      {order.status.toLowerCase()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400 py-8">Nenhum pedido encontrado para esta pulseira.</p>
          )}
        </div>

        <div className="border-t border-gray-600 pt-4 flex justify-between items-center text-2xl font-bold text-white">
          <span>Gasto Total:</span>
          <span>R$ {grandTotal.toFixed(2)}</span>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onClose} className="p-4 text-lg bg-blue-600 hover:bg-blue-700">Fechar</Button>
        </div>
      </div>
    </div>
  );
}
