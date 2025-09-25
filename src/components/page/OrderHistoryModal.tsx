import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: Product;
}

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

interface IOrder {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface IWristbandWithDetails {
  id: string;
  code: string;
  orders: IOrder[];
}

interface OrderHistoryModalProps {
  wristband: IWristbandWithDetails | null;
  onClose: () => void;
}

export function OrderHistoryModal({ wristband, onClose }: OrderHistoryModalProps) {
  if (!wristband) return null;

  const grandTotal = wristband.orders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2">Histórico de Consumo</h2>
        <p className="text-lg text-amber-400 mb-6">{wristband.code}</p>

        <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-6 mb-6">
          {wristband.orders.length > 0 ? (
            <>
              <p className="text-md font-semibold mb-3 text-gray-300">Consumo:</p>
              <ul className="space-y-2">
                {wristband.orders.map((order) => (
                  <li key={order.id} className="bg-gray-700/50 px-4 py-1 rounded-lg">
                    <ul>
                      {order.orderItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center text-gray-300 text-lg">
                          <span>{item.product.name} (x{item.quantity})</span>
                          <span className='font-bold text-xl text-emerald-400'>R$ {parseFloat(item.totalPrice).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-center text-gray-400 py-8">Nenhum consumo registrado para esta pulseira.</p>
          )}
        </div>

        <div className="border-t border-gray-600 pt-4 flex justify-between items-center text-2xl font-bold text-white">
          <span>Gasto Total:</span>
          <span className='font-mono'>R$ {grandTotal.toFixed(2)}</span>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onClose} className="p-4 text-lg bg-blue-600 hover:bg-blue-700">Fechar</Button>
        </div>
      </div>
    </div>
  );
}