import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryId: string;
}

interface OrderSummaryProps {
    wristbandCode: string;
    setWristbandCode: (code: string) => void;
    handleCheckConsumption: () => void;
    isLoadingConsumption: boolean;
    currentOrder: Product[];
    total: number;
    submitMessage: string;
    handleFinalizeOrder: () => void;
    isSubmitting: boolean;
}

export function OrderSummary({
    wristbandCode,
    setWristbandCode,
    handleCheckConsumption,
    isLoadingConsumption,
    currentOrder,
    total,
    submitMessage,
    handleFinalizeOrder,
    isSubmitting
}: OrderSummaryProps) {
    return (
        <div className="flex-1 h-fit sticky top-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <label htmlFor="wristband-code" className="font-medium text-gray-300">Código da Mesa</label>
              <div className="flex gap-2">
                <Input
                  id="wristband-code"
                  type="text"
                  value={wristbandCode}
                  onChange={(e) => setWristbandCode(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"
                  placeholder="Ex: cliente001"
                  disabled={isSubmitting}
                />
                <Button onClick={handleCheckConsumption} disabled={!wristbandCode || isLoadingConsumption} className="bg-purple-600 hover:bg-purple-700">
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
              disabled={!wristbandCode || currentOrder.length === 0 || isSubmitting}
              className="w-full p-6 text-lg font-bold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar à mesa'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
}
