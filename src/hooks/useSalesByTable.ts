import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface SalesByTableData {
  tableNumber: number;
  total: number;
}

const fetchSalesByTable = async (period: 'week' | 'month'): Promise<SalesByTableData[]> => {
  const response = await api.get('/reports/sales-by-table', { params: { period } });
  return response.data;
};

export const useSalesByTable = (period: 'week' | 'month') => {
  return useQuery<SalesByTableData[], Error>({
    queryKey: ['sales-by-table', period], 
    queryFn: () => fetchSalesByTable(period),
  });
};
