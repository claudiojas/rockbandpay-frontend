import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Este tipo precisa ser expandido ou importado de types.ts
export interface ActiveSessionOverview {
  sessionId: string;
  tableNumber: number;
  tableId: string;
  totalConsumed: number;
}

const fetchActiveSessions = async (): Promise<ActiveSessionOverview[]> => {
  const response = await api.get('/overview/sessions');
  return response.data;
};

export function useActiveSessions() {
  return useQuery<ActiveSessionOverview[], Error>({
    queryKey: ['active-sessions'],
    queryFn: fetchActiveSessions,
  });
}
