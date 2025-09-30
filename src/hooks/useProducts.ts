import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// Funções para alterar o status do produto
const markAsSoldOut = async (productId: string) => {
  const response = await api.patch(`/products/${productId}/sold-out`);
  return response.data;
};

const markAsAvailable = async (productId: string) => {
  const response = await api.patch(`/products/${productId}/available`);
  return response.data;
};

// Hook para atualizar o status do produto
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { productId: string; isSoldOut: boolean }>({
    mutationFn: ({ productId, isSoldOut }) => {
      return isSoldOut ? markAsAvailable(productId) : markAsSoldOut(productId);
    },
    onSuccess: () => {
      // Invalida a query de produtos para forçar a re-busca
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
