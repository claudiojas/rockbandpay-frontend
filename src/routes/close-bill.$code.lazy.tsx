/* eslint-disable @typescript-eslint/no-explicit-any */

import { createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Interfaces based on the API response from /wristbands/{code}
interface Product {
  id: string;
  name: string;
  price: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

interface Order {
  id: string;
  totalAmount: string;
  orderItems: OrderItem[];
  wristbandId: string;
}

const paymentOptions = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'DEBIT', label: 'Cartão de Débito' },
  { value: 'CREDIT', label: 'Cartão de Crédito' },
] as const;

type PaymentMethodValue = typeof paymentOptions[number]['value'];

export const Route = createLazyFileRoute('/close-bill/$code')({
  component: CloseBill,
})

function CloseBill() {
  const { code } = useParams({ from: '/close-bill/$code' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: orders, isLoading, error } = useQuery<Order[]>({    queryKey: ['wristband-details', code],
    queryFn: async () => {
      const response = await api.get<{ orders: Order[] }>(`/wristbands/${code}`);
      return response.data.orders;
    },
  });

  const wristbandId = orders && orders.length > 0 ? orders[0].wristbandId : null;

  const closeBillMutation = useMutation({
    mutationFn: async (paymentData: { wristbandId: string; paymentMethod: PaymentMethodValue }) => {
      const response = await api.post('/payments/close-bill', paymentData);
      return response.data;
    },
    onSuccess: (data) => {
      const amount = parseFloat(data.payment.amount).toFixed(2);
      setFeedbackMessage({ type: 'success', text: `✅ Conta paga com sucesso! Valor: R$ ${amount}` });
      queryClient.invalidateQueries({ queryKey: ['wristbands'] });
      queryClient.removeQueries({ queryKey: ['wristband-details', code] });
      setTimeout(() => navigate({ to: '/wristbands-overview' }), 3000);
    },
    onError: (err: any) => {
      let message = 'Ocorreu um erro no sistema. Tente novamente.';
      if (err.response) {
        // eslint-disable-next-line no-console
        console.error('API Error:', err.response);
        message = `Erro da API: ${err.response.status} - ${err.response.data?.message || err.message}`;
      } else {
        // eslint-disable-next-line no-console
        console.error('Network Error:', err);
        message = `Erro de rede: ${err.message}`;
      }
      setFeedbackMessage({ type: 'error', text: message });
    },
  });

  const handleConfirmPayment = () => {
    if (paymentMethod && wristbandId) {
      closeBillMutation.mutate({ wristbandId, paymentMethod });
    } else {
      setFeedbackMessage({ type: 'error', text: 'Erro: Não foi possível obter o ID da pulseira para o pagamento.' });
    }
  };

  if (isLoading) return <div className="p-6 text-white">Carregando detalhes da conta...</div>;
  if (error) return <div className="p-6 text-red-500">Erro ao carregar detalhes: {error.message}</div>;

  const allItems = orders?.flatMap(order => order.orderItems || []).filter(Boolean) ?? [];
  const grandTotal = orders?.reduce((acc, order) => acc + parseFloat(order.totalAmount || '0'), 0) ?? 0;

  if (feedbackMessage) {
    return (
      <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
        <div className={`text-2xl font-bold ${feedbackMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {feedbackMessage.text}
        </div>
        {feedbackMessage.type === 'success' && <p className="mt-4">Você será redirecionado em breve...</p>}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex justify-center items-center">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold">Fechamento de Conta</CardTitle>
          <p className="text-gray-400">Pulseira: <span className="font-mono text-lg">{code}</span></p>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Resumo da Conta</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-3 mb-6">
            {allItems.length > 0 ? (
              <ul className="space-y-3">
                {allItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-gray-300">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span className="font-medium">R$ {parseFloat(item.unitPrice || '0').toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Nenhum item a ser pago.</p>
            )}
          </div>
          <div className="text-2xl font-bold flex justify-between items-center border-t border-gray-700 pt-4">
            <span>Total:</span>
            <span>R$ {grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
            <h3 className="text-lg font-semibold text-center">Selecione o Método de Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
                {paymentOptions.map(option => (
                    <Button 
                        key={option.value}
                        onClick={() => setPaymentMethod(option.value)}
                        className={`p-6 text-lg ${paymentMethod === option.value ? 'bg-green-600' : 'bg-gray-700'}`}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
            <Button 
                onClick={handleConfirmPayment}
                disabled={!paymentMethod || closeBillMutation.isPending || allItems.length === 0}
                className="w-full p-6 text-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 mt-4"
            >
                {closeBillMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}