/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useTableContext } from '@/contexts/TableContext';
import { api } from '../lib/axios';
import type { Product, ISessionDetails, Session } from '../types';
import { AxiosError } from 'axios';

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
  const { tableId, setTableId, selectedTable } = useTableContext();

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
    categories.forEach(category => {
      const prods = filteredProducts.filter(p => p.categoryId === category.id);
      if (prods.length > 0) {
        grouped[category.name] = prods;
      }
    });
    return grouped;
  }, [products, categories, searchTerm, selectedCategoryId]);

  const handleFinalizeOrder = async () => {
    if (!tableId || currentOrder.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage('Finalizando pedido...');

    try {
      const sessionResponse = await api.get<Session>(`/sessions/table/${tableId}/active`);
      const session = sessionResponse.data;
      if (!session) {
        throw new Error('Nenhuma sessão ativa encontrada para esta mesa. Inicie uma nova sessão.');
      }

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
        sessionId: session.id,
        items: groupedItems
      });

      setSubmitMessage('Pedido finalizado com sucesso!');
      setCurrentOrder([]);
      setTableId('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao finalizar o pedido.';
      setSubmitMessage(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckConsumption = async () => {
    if (!tableId || !selectedTable) return;
    setIsLoadingConsumption(true);
    setSubmitMessage('');

    try {
      const sessionResponse = await api.get<Session>(`/sessions/table/${tableId}/active`);
      const session = sessionResponse.data;

      const consumptionResponse = await api.get<Omit<ISessionDetails, 'table'>>(`/orders/session/${session.id}`);
      setSessionDetails({ ...consumptionResponse.data, table: selectedTable });
      setShowOrderHistoryModal(true);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        setSessionDetails({ id: '', tableId, status: 'CLOSED', table: selectedTable, orders: [] });
        setShowOrderHistoryModal(true);
      } else {
        const errorMessage = (err as any).response?.data?.message || (err as Error).message || 'Falha ao buscar histórico.';
        setSubmitMessage(`Erro: ${errorMessage}`);
      }
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
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          onProductClick={setSelectedProduct}
        />
        <OrderSummary
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
