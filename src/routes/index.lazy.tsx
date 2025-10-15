/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { api } from '../lib/axios';
import type { Product, ISessionDetails } from '../types';

import { Button } from '@/components/ui/button';
import { MenuList } from '@/components/page/MenuList';
import { OrderSummary } from '@/components/page/OrderSummary';
import { ProductModal } from '@/components/page/ProductModal';
import { OrderHistoryModal } from '@/components/page/OrderHistoryModal';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts, error: errorProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  const [sessionId, setSessionId] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [sessionDetails, setSessionDetails] = useState<ISessionDetails | null>(null);
  const [isLoadingConsumption, setIsLoadingConsumption] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);

  const addProductToOrder = (product: Product, quantity: number) => {
    setSubmitMessage('');
    const itemsToAdd = Array(quantity).fill(product);
    setCurrentOrder(prevOrder => [...prevOrder, ...itemsToAdd]);
    setSelectedProduct(null);
  };

  const total = useMemo(() => {
    return currentOrder.reduce((acc, item) => acc + parseFloat(item.price), 0);
  }, [currentOrder]);

  const productsByCategory = useMemo(() => {
    if (!products || !categories) return {};
    let filteredProducts = products;
    if (selectedCategoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === selectedCategoryId);
    }
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const grouped: Record<string, Product[]> = {};
    categories?.forEach(category => {
      const prods = filteredProducts.filter(p => p.categoryId === category.id);
      if (prods.length > 0) {
        grouped[category.name] = prods;
      }
    });
    return grouped;
  }, [products, categories, searchTerm, selectedCategoryId]);

  const handleFinalizeOrder = async () => {
    if (!sessionId || currentOrder.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage('Adicionando ao pedido...');

    try {
      const groupedItems = currentOrder.reduce((acc, product) => {
        const existingItem = acc.find(item => item.productId === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ productId: product.id, quantity: 1 });
        }
        return acc;
      }, [] as { productId: string; quantity: number }[]);

      await api.post('/orders', { 
        sessionId: sessionId,
        items: groupedItems
      });

      setSubmitMessage('Itens adicionados com sucesso!');
      setCurrentOrder([]);
      setSessionId('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Falha ao adicionar itens.';
      setSubmitMessage(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckConsumption = async () => {
    if (!sessionId) return;
    setIsLoadingConsumption(true);
    setSubmitMessage('');
    try {
      const consumptionResponse = await api.get<ISessionDetails>(`/orders/session/${sessionId}`);
      setSessionDetails(consumptionResponse.data);
      setShowOrderHistoryModal(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Falha ao buscar histórico.';
      console.error(`Erro: ${errorMessage}`);
      setShowOrderHistoryModal(true);
    } finally {
      setIsLoadingConsumption(false);
    }
  };

  if (isLoadingProducts || isLoadingCategories) {
    return <div className="p-8 text-center text-white">Carregando...</div>;
  }

  if (isErrorProducts) {
    return <div className="p-8 text-center text-red-500">Ocorreu um erro: {errorProducts.message}</div>;
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ponto de Venda</h1>
        <Link to="/cash-register/close">
          <Button variant="outline">Fechar Caixa</Button>
        </Link>
      </header>
      <div className="flex gap-8">
        <MenuList
          productsByCategory={productsByCategory}
          categories={categories ?? []}
          isLoadingCategories={isLoadingCategories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          onProductClick={setSelectedProduct}
        />
        <OrderSummary
          sessionId={sessionId}
          setSessionId={setSessionId}
          handleCheckConsumption={handleCheckConsumption}
          isLoadingConsumption={isLoadingConsumption}
          currentOrder={currentOrder}
          total={total}
          submitMessage={submitMessage}
          handleFinalizeOrder={handleFinalizeOrder}
          isSubmitting={isSubmitting}
        />

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToOrder={addProductToOrder}
          />
        )}
        {showOrderHistoryModal && (
          <OrderHistoryModal
            sessionDetails={sessionDetails}
            onClose={() => setShowOrderHistoryModal(false)}
          />
        )}
      </div>
    </div>
  );
}