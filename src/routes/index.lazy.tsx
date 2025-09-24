/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '../lib/axios';

interface Product {
  id: string;
  name: string;
  price: string;
}

interface Wristband {
  id: string;
  code: string;
}

interface Order {
  id: string;
  wristbandId: string;
}

interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: products, isLoading, isError, error } = useProducts();
  const [wristbandCode, setWristbandCode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Product[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const addProductToOrder = (product: Product) => {
    setSubmitMessage('');
    setCurrentOrder([...currentOrder, product]);
  };

  const total = useMemo(() => {
    return currentOrder.reduce((acc, item) => acc + parseFloat(item.price), 0);
  }, [currentOrder]);

  const handleFinalizeOrder = async () => {
    if (!wristbandCode || currentOrder.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage('Finalizando pedido...');

    try {
      // 1. Buscar a pulseira pelo código
      const wristbandResponse = await api.get<Wristband>(`/wristbands/${wristbandCode}`);
      const wristband = wristbandResponse.data;
      if (!wristband) {
        throw new Error('Pulseira não encontrada.');
      }

      // 2. Criar o pedido
      const orderResponse = await api.post<Order>('/orders', { wristbandId: wristband.id });
      const newOrder = orderResponse.data;

      // 3. Agrupar produtos e montar payload dos itens
      const groupedItems = currentOrder.reduce((acc, product) => {
        acc[product.id] = (acc[product.id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const itemsPayload: OrderItemPayload[] = Object.keys(groupedItems).map(productId => ({
        productId,
        quantity: groupedItems[productId],
      }));

      // 4. Adicionar itens ao pedido
      await api.post(`/orders/${newOrder.id}/items`, { items: itemsPayload });

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

  if (isLoading) {
    return <div className="p-8 text-center text-white">Carregando produtos...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Ocorreu um erro: {error.message}</div>;
  }

  return (
    <div className="flex gap-8 p-8 bg-gray-900 text-gray-100 min-h-screen">
      {/* Coluna do Cardápio */}
      <div className="flex-[3]">
        <h2 className="text-3xl font-bold mb-6 text-gray-50">Cardápio</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
          {products?.map((product) => (
            <Card
              key={product.id}
              className="bg-gray-800 border-gray-700 text-white flex flex-col transition-transform duration-200 hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-2xl font-semibold text-emerald-400">
                  R$ {parseFloat(product.price).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => addProductToOrder(product)} className="w-full bg-blue-600 hover:bg-blue-700">
                  Adicionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Coluna do Pedido */}
      <div className="flex-1 h-fit sticky top-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <label htmlFor="wristband-code" className="font-medium text-gray-300">
                Código da Pulseira
              </label>
              <Input
                id="wristband-code"
                type="text"
                value={wristbandCode}
                onChange={(e) => setWristbandCode(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"
                placeholder="Ex: cliente001"
                disabled={isSubmitting}
              />
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Itens:</h3>
              <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
                {currentOrder.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400">Nenhum item no pedido.</p>
                  </div>
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
              <p className={`text-center text-sm ${submitMessage.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>
                {submitMessage}
              </p>
            )}
            <Button
              onClick={handleFinalizeOrder}
              disabled={!wristbandCode || currentOrder.length === 0 || isSubmitting}
              className="w-full p-6 text-lg font-bold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400"
            >
              {isSubmitting ? 'Finalizando...' : 'Finalizar Pedido'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}