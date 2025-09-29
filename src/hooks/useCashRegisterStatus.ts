import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Definição da interface para os detalhes do caixa, pode ser expandida conforme necessário
interface CashRegisterDetails {
  id: string;
  openedAt: string;
  // Adicione outros campos que a API retorna, se houver
}

export function useCashRegisterStatus() {
  const { data, isLoading, error } = useQuery<CashRegisterDetails | null>({
    queryKey: ['cash-register-status'],
    queryFn: async () => {
      try {
        const response = await api.get<CashRegisterDetails>('/cash-register/active-details');
        return response.data;
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          return null; // Retorna null se o caixa não for encontrado (404)
        }
        throw err; // Lança outros erros para o React Query tratar
      }
    },
    retry: false, // Não tenta novamente em caso de erro, especialmente 404
    refetchOnWindowFocus: false, // Evita refetchs desnecessários ao focar na janela
  });

  return {
    isLoading,
    isActive: !!data && !error,
    cashRegister: data,
    error,
  };
}
