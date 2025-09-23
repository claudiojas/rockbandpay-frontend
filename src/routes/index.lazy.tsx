import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';

// Define a interface para um único produto, para termos tipagem forte
interface Product {
  id: string;
  name: string;
  price: string;
}

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: products, isLoading, isError, error } = useProducts();
  const [wristbandCode, setWristbandCode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Product[]>([]);

  const addProductToOrder = (product: Product) => {
    setCurrentOrder([...currentOrder, product]);
  };

  if (isLoading) {
    return <div className="p-4">Carregando produtos...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Ocorreu um erro: {error.message}</div>;
  }

  return (
    <div className="flex p-4 font-sans">
      {/* Coluna do Cardápio */}
      <div className="flex-[2] mr-4">
        <h2 className="text-2xl font-bold mb-4">Cardápio</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {products?.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 text-center shadow">
              <p className="font-bold">{product.name}</p>
              <p>R$ {product.price}</p>
              <button
                onClick={() => addProductToOrder(product)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna do Pedido */}
      <div className="flex-1 border rounded-lg p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Pedido Atual</h2>
        <div className="mb-4">
          <label htmlFor="wristband-code" className="block mb-1 font-medium">
            Código da Pulseira:
          </label>
          <input
            id="wristband-code"
            type="text"
            value={wristbandCode}
            onChange={(e) => setWristbandCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Itens do Pedido:</h3>
          {currentOrder.length === 0 ? (
            <p>Nenhum item adicionado.</p>
          ) : (
            <ul className="list-none p-0">
              {currentOrder.map((item, index) => (
                <li key={index} className="flex justify-between mb-1">
                  <span>{item.name}</span>
                  <span>R$ {item.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => alert(`Pedido para a pulseira ${wristbandCode} finalizado!`)}
          disabled={!wristbandCode || currentOrder.length === 0}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}
