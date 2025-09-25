/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { api } from '../lib/axios';

// Import new components
import { MenuList } from '@/components/page/MenuList';
import { OrderSummary } from '@/components/page/OrderSummary';
import { ProductModal } from '@/components/page/ProductModal';
import { OrderHistoryModal } from '@/components/page/OrderHistoryModal';

// Interfaces
interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryId: string;
}

interface Wristband {
  id: string;
  code: string;
}

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

interface IOrder {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
}

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts, error: errorProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const [wristbandCode, setWristbandCode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [orderHistory, setOrderHistory] = useState<IOrder[] | null>(null);
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
    if (!wristbandCode || currentOrder.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage('Finalizando pedido...');

    try {
      const wristbandResponse = await api.get<Wristband>(`/wristbands/${wristbandCode}`);
      const wristband = wristbandResponse.data;
      if (!wristband) throw new Error('Pulseira não encontrada.');

      const orderResponse = await api.post<IOrder>('/orders', { wristbandId: wristband.id, orderValue: total });
      const newOrder = orderResponse.data;

      const groupedItems = currentOrder.reduce((acc, product) => {
        if (!acc[product.id]) {
          acc[product.id] = {
            productId: product.id,
            quantity: 0,
            unitPrice: parseFloat(product.price),
          };
        }
        acc[product.id].quantity += 1;
        return acc;
      }, {} as Record<string, { productId: string; quantity: number; unitPrice: number; }>);

      const addItemPromises = Object.values(groupedItems).map(item => {
        const payload = {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        };
        return api.post(`/orders/${newOrder.id}/items`, payload);
      });

      await Promise.all(addItemPromises);

      setSubmitMessage('Pedido finalizado com sucesso!');
      setCurrentOrder([]);
      setWristbandCode('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao finalizar o pedido.';
      setSubmitMessage(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckConsumption = async () => {
    if (!wristbandCode) return;
    setIsLoadingConsumption(true);
    setSubmitMessage('');
    try {
      const wristbandRes = await api.get<Wristband>(`/wristbands/${wristbandCode}`);
      const wristbandId = wristbandRes.data?.id;

      if (!wristbandId) {
        throw new Error('Pulseira não encontrada.');
      }

      const historyRes = await api.get<IOrder[]>(`/orders/${wristbandId}`);
      setOrderHistory(historyRes.data || []);
      setShowOrderHistoryModal(true);

    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        if (err.config.url.includes('/orders/')) {
          setOrderHistory([]);
          setShowOrderHistoryModal(true);
        } else {
          setSubmitMessage('Erro: Pulseira não encontrada.');
        }
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Falha ao buscar histórico.';
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
    <div className="flex gap-8 p-8 bg-gray-900 text-gray-100 min-h-screen">
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
        wristbandCode={wristbandCode}
        setWristbandCode={setWristbandCode}
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
      {showOrderHistoryModal && orderHistory && (
        <OrderHistoryModal
          orders={orderHistory}
          onClose={() => setShowOrderHistoryModal(false)}
          wristbandCode={wristbandCode}
        />
      )}
    </div>
  );
}
