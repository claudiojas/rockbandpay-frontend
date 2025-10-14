/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { api } from '../lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { useTableContext } from '@/contexts/TableContext';

export const Route = createLazyFileRoute('/manage-tables')({
  component: ManageTables,
});

function ManageTables() {
  const queryClient = useQueryClient();
  const { tables, isLoadingTables: isLoading } = useTableContext();
  const [tableNumber, setTableNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const num = parseInt(tableNumber, 10);
    if (isNaN(num) || num <= 0) {
      setMessage('Por favor, insira um número de mesa válido.');
      return;
    }

    try {
      await api.post('/tables', { tableNumber: num });
      setMessage(`Mesa "${num}" criada com sucesso!`);
      setTableNumber('');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao criar a mesa.';
      setMessage(errorMessage);
    }
  };

  const getTableUrl = (tableId: string) => {
    return `${window.location.origin}/customer/start?tableId=${tableId}`;
  };

  return (
    <div className="p-8 font-sans bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Gerenciar Mesas</h2>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Adicionar Nova Mesa</h3>
          <form onSubmit={handleCreateTable} className="flex items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="table-number" className="block mb-1 font-medium text-sm text-gray-300">
                Número da Mesa:
              </label>
              <input
                id="table-number"
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Ex: 15"
                min="1"
              />
            </div>
            <button
              type="submit"
              className="p-2 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 h-10"
            >
              Criar
            </button>
          </form>
          {message && <p className={`mt-4 text-sm ${message.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">Mesas Cadastradas</h3>
          {isLoading ? (
            <p>Carregando mesas...</p>
          ) : tables && tables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.sort((a, b) => a.tableNumber - b.tableNumber).map(table => (
                <div key={table.id} className="bg-gray-800 p-4 rounded-lg flex flex-col items-center gap-3">
                  <h4 className="text-xl font-bold text-amber-400">Mesa {table.tableNumber}</h4>
                  <div className="bg-white p-4 rounded-md">
                    <QRCodeCanvas
                      value={getTableUrl(table.id)}
                      size={180}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"L"}
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center break-all">{getTableUrl(table.id)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nenhuma mesa cadastrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}