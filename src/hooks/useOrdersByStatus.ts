import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { IOrder, OrderStatus } from '../types';

const fetchOrdersByStatus = async (status: OrderStatus): Promise<IOrder[]> => {
  const response = await api.get('/orders', { params: { status } });
  return response.data;
};

export const useOrdersByStatus = (status: OrderStatus) => {
  return useQuery<IOrder[], Error>({
    queryKey: ['orders', status], 
    queryFn: () => fetchOrdersByStatus(status),
  });
};
