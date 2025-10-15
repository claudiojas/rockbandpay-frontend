import { createLazyFileRoute } from '@tanstack/react-router';
import { useProducts } from '../hooks/useProducts';
import { useState } from 'react';
import type { Product } from '@/types';
import { EditProductModal } from '@/components/page/EditProductModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const Route = createLazyFileRoute('/manage-products')({
  component: ManageProducts,
});

function ManageProducts() {
  const { data: products, isLoading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-white">Carregando produtos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro ao carregar produtos: {error.message}</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gerenciamento de Produtos</h1>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-white">Nome</TableHead>
                <TableHead className="text-white">Preço</TableHead>
                <TableHead className="text-white text-right">Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map(product => (
                <TableRow 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer border-gray-800 hover:bg-gray-800"
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>R$ {parseFloat(product.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedProduct && (
        <EditProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
