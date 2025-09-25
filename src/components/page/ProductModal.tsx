import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Interfaces should ideally be in a central file (e.g., src/interfaces/Product.ts)
interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryId: string;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToOrder: (product: Product, quantity: number) => void;
}

export function ProductModal({ product, onClose, onAddToOrder }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (quantity > 0) {
      onAddToOrder(product, quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
        {product.description && <p className="text-gray-300 mb-6 text-base">{product.description}</p>}
        <p className="text-4xl font-semibold text-emerald-400 mb-8">
          R$ {parseFloat(product.price).toFixed(2)}
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <label htmlFor="quantity" className="text-lg font-medium">Quantidade:</label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-gray-700 border-gray-600 text-white text-lg p-2 text-center"
            min="1"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={onClose} className="w-full p-6 text-lg bg-gray-600 hover:bg-gray-700">Cancelar</Button>
          <Button onClick={handleAdd} className="w-full p-6 text-lg bg-blue-600 hover:bg-blue-700">Adicionar ao Pedido</Button>
        </div>
      </div>
    </div>
  );
}
