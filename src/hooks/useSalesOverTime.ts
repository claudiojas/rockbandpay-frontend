import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface SalesOverTimeData {
  date: string;
  total: number;
}

const fetchSalesOverTime = async (period: 'week' | 'month'): Promise<SalesOverTimeData[]> => {
  const response = await api.get('/reports/sales-over-time', { params: { period } });
  return response.data;
};

export const useSalesOverTime = (period: 'week' | 'month') => {
  return useQuery<SalesOverTimeData[], Error>({
    queryKey: ['sales-over-time', period], 
    queryFn: () => fetchSalesOverTime(period),
  });
};
