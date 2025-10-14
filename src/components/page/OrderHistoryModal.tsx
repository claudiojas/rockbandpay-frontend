import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import type { ISessionDetails } from '@/types';

interface OrderHistoryModalProps {
  sessionDetails: ISessionDetails | null;
  onClose: () => void;
}

export function OrderHistoryModal({ sessionDetails, onClose }: OrderHistoryModalProps) {

  const orders = sessionDetails?.orders ?? [];
  const grandTotal = orders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2">Histórico de Consumo</h2>
        {sessionDetails ? (
          <p className="text-lg text-amber-400 mb-6">Mesa: {sessionDetails.table.tableNumber}</p>
        ) : (
          <p className="text-lg text-gray-400 mb-6">Nenhuma sessão ativa para esta mesa.</p>
        )}

        <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-6 mb-6">
          {orders.length > 0 ? (
            <>
              <p className="text-md font-semibold mb-3 text-gray-300">Consumo Pendente:</p>
              <ul className="space-y-2">
                {orders.map((order) => (
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
            <p className="text-center text-gray-400 py-8">Nenhum consumo pendente para esta sessão.</p>
          )}
        </div>

        {sessionDetails && orders.length > 0 && (
          <>
            <div className="border-t border-gray-600 pt-4 flex justify-between items-center text-2xl font-bold text-white">
              <span>Total Pendente:</span>
              <span className='font-mono'>R$ {grandTotal.toFixed(2)}</span>
            </div>
            <div className="mt-8 text-center flex gap-2">
              <Button onClick={onClose} className="p-4 text-md bg-blue-600 hover:bg-blue-700">Sair</Button>
              <Link to="/close-bill/$code" params={{ code: sessionDetails.id }}>
                <Button className="p-4 text-md bg-green-600 hover:bg-green-700">Fechar conta</Button>
              </Link>
            </div>
          </>
        )}
         {!sessionDetails && (
            <div className="mt-8 text-center">
                <Button onClick={onClose} className="p-4 text-md bg-blue-600 hover:bg-blue-700">Voltar</Button>
            </div>
        )}
      </div>
    </div>
  );
}