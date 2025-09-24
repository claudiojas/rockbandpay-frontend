import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Define a interface para uma única categoria
interface Category {
  id: string;
  name: string;
}

// A função que busca as categorias
const fetchCategories = async (): Promise<Category[]> => {
  // Assumindo que o endpoint para listar todas as categorias é /categories
  const response = await api.get('/categories');
  return response.data;
};

// Hook customizado para buscar categorias
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};