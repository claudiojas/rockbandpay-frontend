/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Definição de tipos com base na documentação da API
interface PaymentBreakdown {
  method: string;
  total: number;
}

interface SoldProduct {
  productId: string;
  name: string;
  quantity: number;
  totalValue: number;
}

interface CashRegisterDetails {
  id: string;
  openedAt: string;
  initialValue: number;
  totalPayments: number;
  expectedInCash: number;
  paymentsBreakdown: PaymentBreakdown[];
  soldProducts: SoldProduct[];
}

export const Route = createLazyFileRoute('/cash-register/close')({
  component: CloseCashRegisterComponent,
})

function CloseCashRegisterComponent() {
  const [details, setDetails] = useState<CashRegisterDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    api.get<CashRegisterDetails>('/cash-register/active-details')
      .then(response => {
        setDetails(response.data);
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setError('Nenhum caixa aberto no momento.');
        } else {
          setError('Erro ao carregar os detalhes do caixa.');
        }
        console.error(err);
      });
  }, []);

  const closeCashRegisterMutation = useMutation({
    mutationFn: async () => {
      return api.post('/cash-register/close');
    },
    onSuccess: () => {
      // Invalida a query de status para que o hook global seja notificado
      queryClient.invalidateQueries({ queryKey: ['cash-register-status'] });
      alert('Caixa fechado com sucesso! Redirecionando para o login.');
      // Redireciona para a página de login
      navigate({ to: '/login', replace: true });
    },
    onError: (err) => {
      alert('Erro ao fechar o caixa. Verifique se ele ainda está aberto.');
      console.error(err);
    }
  });

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Voltar para o Início
        </Button>
      </div>
    );
  }

  if (!details) {
    return <div className="p-4">Carregando detalhes do caixa...</div>;
  }

  return (
    <div className='bg-gray-900 min-h-screen' >
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold">Detalhes e Fechamento de Caixa</h1>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Valor de Abertura</p>
              <p className="text-2xl font-semibold">R$ {parseFloat(details.initialValue as any).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Recebido</p>
              <p className="text-2xl font-semibold">R$ {parseFloat(details.totalPayments as any).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-sm font-medium text-green-800">Valor Esperado em Caixa</p>
              <p className="text-2xl font-bold text-green-800">R$ {parseFloat(details.expectedInCash as any).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes por Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {details.paymentsBreakdown.map(p => (
                  <li key={p.method} className="flex justify-between">
                    <span>{p.method}</span>
                    <span className="font-medium">R$ {parseFloat(p.total as any).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2">Produto</th>
                      <th scope="col" className="px-4 py-2 text-center">Qtd.</th>
                      <th scope="col" className="px-4 py-2 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.soldProducts.map(p => (
                      <tr key={p.productId} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">{p.name}</td>
                        <td className="px-4 py-2 text-center">{p.quantity}</td>
                        <td className="px-4 py-2 text-right">R$ {parseFloat(p.totalValue as any).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            size="lg"
            variant="destructive"
            onClick={() => closeCashRegisterMutation.mutate()}
            disabled={closeCashRegisterMutation.isPending}
          >
            {closeCashRegisterMutation.isPending ? 'Fechando...' : 'Fechar Caixa'}
          </Button>
        </div>
      </div>
    </div>
  );
}