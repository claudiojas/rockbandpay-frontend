/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '../lib/axios';

// Interfaces
interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryId: string;
}

interface Wristband {
  id: string;
  code: string;
}

// Based on backend/src/interfaces/order.interface.ts
type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

interface IOrder {
  id: string;
  status: OrderStatus;
  totalAmount: string; // Prisma Decimal is serialized as a string
  createdAt: string; // Dates are serialized as strings
}

// --- Componente Principal ---
export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts, error: errorProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const [wristbandCode, setWristbandCode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [orderHistory, setOrderHistory] = useState<IOrder[] | null>(null);
  const [isLoadingConsumption, setIsLoadingConsumption] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);

  const addProductToOrder = (product: Product, quantity: number) => {
    setSubmitMessage('');
    const itemsToAdd = Array(quantity).fill(product);
    setCurrentOrder(prevOrder => [...prevOrder, ...itemsToAdd]);
    setSelectedProduct(null);
  };

  const total = useMemo(() => {
    return currentOrder.reduce((acc, item) => acc + parseFloat(item.price), 0);
  }, [currentOrder]);

  const productsByCategory = useMemo(() => {
    if (!products || !categories) return {};

    const grouped: Record<string, Product[]> = {};

    categories.forEach(category => {
      const prods = products.filter(p => p.categoryId === category.id);
      if (prods.length > 0) {
        grouped[category.name] = prods;
      }
    });

    return grouped;
  }, [products, categories]);

  const handleFinalizeOrder = async () => {
    if (!wristbandCode || currentOrder.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage('Finalizando pedido...');

    try {
      const wristbandResponse = await api.get<Wristband>(`/wristbands/${wristbandCode}`);
      const wristband = wristbandResponse.data;
      if (!wristband) throw new Error('Pulseira não encontrada.');

      const orderResponse = await api.post<IOrder>('/orders', { wristbandId: wristband.id });
      const newOrder = orderResponse.data;

      const groupedItems = currentOrder.reduce((acc, product) => {
        if (!acc[product.id]) {
          acc[product.id] = {
            productId: product.id,
            quantity: 0,
            unitPrice: parseFloat(product.price),
          };
        }
        acc[product.id].quantity += 1;
        return acc;
      }, {} as Record<string, { productId: string; quantity: number; unitPrice: number; }>);

      const addItemPromises = Object.values(groupedItems).map(item => {
        const payload = {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        };
        return api.post(`/orders/${newOrder.id}/items`, payload);
      });

      await Promise.all(addItemPromises);

      setSubmitMessage('Pedido finalizado com sucesso!');
      setCurrentOrder([]);
      setWristbandCode('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao finalizar o pedido.';
      setSubmitMessage(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckConsumption = async () => {
    if (!wristbandCode) return;
    setIsLoadingConsumption(true);
    setSubmitMessage('');
    try {
      const wristbandRes = await api.get<Wristband>(`/wristbands/${wristbandCode}`);
      const wristbandId = wristbandRes.data?.id;

      if (!wristbandId) {
        throw new Error('Pulseira não encontrada.');
      }

      const historyRes = await api.get<IOrder[]>(`/orders/${wristbandId}`);
      setOrderHistory(historyRes.data || []);
      setShowOrderHistoryModal(true);

    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        if (err.config.url.includes('/orders/')) {
          setOrderHistory([]);
          setShowOrderHistoryModal(true);
        } else {
          setSubmitMessage('Erro: Pulseira não encontrada.');
        }
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Falha ao buscar histórico.';
        setSubmitMessage(`Erro: ${errorMessage}`);
      }
    } finally {
      setIsLoadingConsumption(false);
    }
  };

  if (isLoadingProducts || isLoadingCategories) {
    return <div className="p-8 text-center text-white">Carregando...</div>;
  }

  if (isErrorProducts) {
    return <div className="p-8 text-center text-red-500">Ocorreu um erro: {errorProducts.message}</div>;
  }

  return (
    <div className="flex gap-8 p-8 bg-gray-900 text-gray-100 min-h-screen">
      {/* Coluna do Cardápio */}
      <div className="flex-[3]">
        <h2 className="text-3xl font-bold mb-6 text-gray-50">Cardápio</h2>
        {Object.keys(productsByCategory).length > 0 ? (
          Object.entries(productsByCategory).map(([categoryName, productsInCategory]) => (
            <div key={categoryName} className="mb-8">
              <h3 className="text-2xl font-bold mt-6 mb-4 text-amber-400 border-b-2 border-amber-400/30 pb-2">{categoryName}</h3>
              <ul className="space-y-2">
                {productsInCategory.map(product => (
                  <li
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="cursor-pointer p-3 rounded-md hover:bg-gray-700/50 flex justify-between items-center transition-colors duration-200"
                  >
                    <span className="text-lg">{product.name}</span>
                    <span className="font-semibold text-emerald-400 text-lg">R$ {parseFloat(product.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Nenhum produto encontrado.</p>
        )}
      </div>

      {/* Coluna do Pedido */}
      <div className="flex-1 h-fit sticky top-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <label htmlFor="wristband-code" className="font-medium text-gray-300">Código da Pulseira</label>
              <div className="flex gap-2">
                <Input
                  id="wristband-code"
                  type="text"
                  value={wristbandCode}
                  onChange={(e) => setWristbandCode(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"
                  placeholder="Ex: cliente001"
                  disabled={isSubmitting}
                />
                <Button onClick={handleCheckConsumption} disabled={!wristbandCode || isLoadingConsumption} className="bg-purple-600 hover:bg-purple-700">
                  {isLoadingConsumption ? '...' : 'Ver'}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Itens do Pedido Atual:</h3>
              <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                {currentOrder.length === 0 ? (
                  <div className="text-center py-10"><p className="text-gray-400">Nenhum item no pedido.</p></div>
                ) : (
                  <ul className="space-y-3">
                    {currentOrder.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-gray-300">
                        <span>{item.name}</span>
                        <span className="font-medium">R$ {parseFloat(item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4 bg-gray-800/50 p-6">
            <div className="flex justify-between items-center text-2xl font-bold text-white">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            {submitMessage && (
              <p className={`text-center text-sm ${submitMessage.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>{submitMessage}</p>
            )}
            <Button
              onClick={handleFinalizeOrder}
              disabled={!wristbandCode || currentOrder.length === 0 || isSubmitting}
              className="w-full p-6 text-lg font-bold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600"
            >
              {isSubmitting ? 'Finalizando...' : 'Finalizar Pedido'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToOrder={addProductToOrder}
        />
      )}
      {showOrderHistoryModal && orderHistory && (
        <OrderHistoryModal
          orders={orderHistory}
          onClose={() => setShowOrderHistoryModal(false)}
          wristbandCode={wristbandCode}
        />
      )}
    </div>
  );
}


// --- Componentes de Modal ---

function ProductModal({ product, onClose, onAddToOrder }: { product: Product; onClose: () => void; onAddToOrder: (product: Product, quantity: number) => void; }) {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (quantity > 0) {
      onAddToOrder(product, quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
        {product.description && <p className="text-gray-300 mb-6 text-base">{product.description}</p>}
        <p className="text-4xl font-semibold text-emerald-400 mb-8">
          R$ {parseFloat(product.price).toFixed(2)}
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <label htmlFor="quantity" className="text-lg font-medium">Quantidade:</label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-gray-700 border-gray-600 text-white text-lg p-2 text-center"
            min="1"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={onClose} className="w-full p-6 text-lg bg-gray-600 hover:bg-gray-700">Cancelar</Button>
          <Button onClick={handleAdd} className="w-full p-6 text-lg bg-blue-600 hover:bg-blue-700">Adicionar ao Pedido</Button>
        </div>
      </div>
    </div>
  );
}

function OrderHistoryModal({ orders, onClose, wristbandCode }: { orders: IOrder[]; onClose: () => void; wristbandCode: string; }) {
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