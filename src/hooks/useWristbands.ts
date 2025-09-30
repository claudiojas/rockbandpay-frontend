import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface Wristband {
  id: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PAID';
}

export function useWristbands() {
  const { data: wristbands, isLoading, error } = useQuery<Wristband[]>({
    queryKey: ['wristbands'],
    queryFn: async () => {
      const response = await api.get('/wristbands');
      // Simulating status for now, as it's not in the original wristband-overview response
      const wristbandsWithStatus = response.data.map((w: Omit<Wristband, 'status'>) => ({ ...w, status: 'ACTIVE' }))
      return wristbandsWithStatus;
    },
  });

  const activeWristbands = wristbands?.filter(w => w.status === 'ACTIVE');

  return {
    wristbands: activeWristbands,
    isLoading,
    error,
  };
}
