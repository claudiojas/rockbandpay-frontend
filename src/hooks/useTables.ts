import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { ITable } from '../types';

async function fetchTables(): Promise<ITable[]> {
  const response = await api.get('/tables');
  return response.data;
}

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
  });
}
