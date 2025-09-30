/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { api } from '../lib/axios';

export const Route = createLazyFileRoute('/wristbands')({
  component: Wristbands,
});

function Wristbands() {
  const [wristbandCode, setWristbandCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateWristband = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!wristbandCode.trim() || !qrCode.trim()) {
      setMessage('Por favor, insira o código e o QR code da pulseira.');
      return;
    }

    try {
      await api.post('/wristbands', { code: wristbandCode, qrCode });
      setMessage(`Pulseira "${wristbandCode}" criada com sucesso!`);
      setWristbandCode('');
      setQrCode('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao criar a pulseira.';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="p-4 font-sans flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Adicionar nova mesa</h2>
      <form onSubmit={handleCreateWristband} className="max-w-sm">
        <div className="mb-4">
          <label htmlFor="wristband-code" className="block mb-1 font-medium">
            Código da Mesa:
          </label>
          <input
            id="wristband-code"
            type="text"
            value={wristbandCode}
            onChange={(e) => setWristbandCode(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Ex: cliente001"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="qr-code" className="block mb-1 font-medium">
            QR Code:
          </label> 
          <input
            id="qr-code"
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Ex: 987654321"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Criar Mesa
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
