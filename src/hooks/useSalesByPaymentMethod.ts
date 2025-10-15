import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface SalesByPaymentMethodData {
  name: string;
  total: number;
}

const fetchSalesByPaymentMethod = async (period: 'week' | 'month'): Promise<SalesByPaymentMethodData[]> => {
  const response = await api.get('/reports/sales-by-payment-method', { params: { period } });
  return response.data;
};

export const useSalesByPaymentMethod = (period: 'week' | 'month') => {
  return useQuery<SalesByPaymentMethodData[], Error>({
    queryKey: ['sales-by-payment-method', period], 
    queryFn: () => fetchSalesByPaymentMethod(period),
  });
};
