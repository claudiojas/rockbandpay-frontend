import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { Product } from '../types';

// A função que realmente busca os dados
const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

// Nosso hook customizado
export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['products'], // Chave única para esta query
    queryFn: fetchProducts,   // Função que será executada para buscar os dados
  });
};
