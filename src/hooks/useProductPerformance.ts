import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface ProductPerformanceData {
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

const fetchProductPerformance = async (period: 'week' | 'month'): Promise<ProductPerformanceData[]> => {
  const response = await api.get('/reports/product-performance', { params: { period } });
  return response.data;
};

export const useProductPerformance = (period: 'week' | 'month') => {
  return useQuery<ProductPerformanceData[], Error>({
    queryKey: ['product-performance', period], 
    queryFn: () => fetchProductPerformance(period),
  });
};
