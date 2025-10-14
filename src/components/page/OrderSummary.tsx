import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActiveSessions } from '@/hooks/useActiveSessions';
import type { Product } from '@/types';

interface OrderSummaryProps {
    sessionId: string;
    setSessionId: (id: string) => void;
    handleCheckConsumption: () => void;
    isLoadingConsumption: boolean;
    currentOrder: Product[];
    total: number;
    submitMessage: string;
    handleFinalizeOrder: () => void;
    isSubmitting: boolean;
}

export function OrderSummary({
    sessionId,
    setSessionId,
    handleCheckConsumption,
    isLoadingConsumption,
    currentOrder,
    total,
    submitMessage,
    handleFinalizeOrder,
    isSubmitting
}: OrderSummaryProps) {

    const { data: activeSessions, isLoading: isLoadingSessions } = useActiveSessions();

    const handleValueChange = (value: string) => {
        setSessionId(value === 'none' ? '' : value);
    }

    return (
        <div className="flex-1 h-fit sticky top-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <label htmlFor="session-select" className="font-medium text-gray-300">Mesa Ativa</label>
              <div className="flex gap-2">
                <Select
                  value={sessionId}
                  onValueChange={handleValueChange}
                  disabled={isSubmitting || isLoadingSessions}
                >
                  <SelectTrigger id="session-select" className="w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500">
                    <SelectValue placeholder="Selecione uma mesa ativa..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    {isLoadingSessions ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {activeSessions?.map(session => (
                          <SelectItem key={session.sessionId} value={session.sessionId}>
                            Mesa {session.tableNumber}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <Button onClick={handleCheckConsumption} disabled={!sessionId || isLoadingConsumption} className="bg-purple-600 hover:bg-purple-700">
                  {isLoadingConsumption ? '...' : 'Ver'}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Itens do Pedido Atual:</h3>
              <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                {currentOrder.length === 0 ? (
                  <div className="text-center py-10"><p className="text-gray-400">Nenhum item no pedido.</p></div>
                ) : (
                  <ul className="space-y-3">
                    {currentOrder.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-gray-300">
                        <span>{item.name}</span>
                        <span className="font-medium">R$ {parseFloat(item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4 bg-gray-800/50 p-6">
            <div className="flex justify-between items-center text-2xl font-bold text-white">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            {submitMessage && (
              <p className={`text-center text-sm ${submitMessage.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>{submitMessage}</p>
            )}
            <Button
              onClick={handleFinalizeOrder}
              disabled={!sessionId || currentOrder.length === 0 || isSubmitting}
              className="w-full p-6 text-lg font-bold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar à mesa'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
}
