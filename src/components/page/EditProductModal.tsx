/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const queryClient = useQueryClient();

  // State for editing product details
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [description, setDescription] = useState(product.description || '');

  // State for adding stock
  const [stockToAdd, setStockToAdd] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset form when product changes
  useEffect(() => {
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description || '');
    setStockToAdd('');
    setMessage(null);
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct: { name?: string; price?: number; description?: string }) => {
      return api.patch(`/products/${product.id}`, updatedProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: `Erro ao atualizar: ${err.response?.data?.error || err.message}` });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: (quantity: number) => {
      return api.patch(`/products/${product.id}/add-stock`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setMessage({ type: 'success', text: 'Estoque adicionado com sucesso!' });
      setStockToAdd('');
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: `Erro ao adicionar estoque: ${err.response?.data?.error || err.message}` });
    },
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate({ name, price: parseFloat(price), description });
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(stockToAdd, 10);
    if (quantity > 0) {
      addStockMutation.mutate(quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Editar Produto: {product.name}</h2>
        
        {/* Edit Details Form */}
        <form onSubmit={handleDetailsSubmit} className="space-y-4 mb-8 border-b border-gray-700 pb-8">
          <h3 className="text-xl font-semibold text-amber-400">Detalhes do Produto</h3>
          <div>
            <label htmlFor="edit-name" className="font-medium text-gray-300">Nome</label>
            <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="bg-gray-700" />
          </div>
          <div>
            <label htmlFor="edit-price" className="font-medium text-gray-300">Preço</label>
            <Input id="edit-price" type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-gray-700" />
          </div>
          <div>
            <label htmlFor="edit-description" className="font-medium text-gray-300">Descrição</label>
            <Textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} className="bg-gray-700" />
          </div>
          <Button type="submit" disabled={updateProductMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
            {updateProductMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>

        {/* Add Stock Form */}
        <form onSubmit={handleAddStockSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-400">Adicionar Estoque</h3>
          <div>
            <label htmlFor="add-stock" className="font-medium text-gray-300">Quantidade a Adicionar</label>
            <Input id="add-stock" type="number" value={stockToAdd} onChange={e => setStockToAdd(e.target.value)} className="bg-gray-700" placeholder="Ex: 20" />
          </div>
          <Button type="submit" disabled={addStockMutation.isPending} className="bg-green-600 hover:bg-green-700">
            {addStockMutation.isPending ? 'Adicionando...' : 'Adicionar Estoque'}
          </Button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}

        <div className="mt-8 text-right">
          <Button onClick={onClose} variant="outline">Fechar</Button>
        </div>
      </div>
    </div>
  );
}
