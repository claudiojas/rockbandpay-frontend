import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Based on the backend schema
interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: string;
  product: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  totalAmount: string;
  createdAt: string;
  orderItems: OrderItem[];
  status: 'PENDING' | 'PAID' | 'CANCELLED';
}

export const Route = createLazyFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { data: orders, isLoading, error } = useQuery<Order[]>({    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-6 text-white">Carregando dados do dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Erro ao carregar dados: {error.message}</div>;
  }

  if (!orders) {
    return <div className="p-6 text-white">Nenhum dado de pedido encontrado.</div>;
  }

  if (!Array.isArray(orders)) {
    return <div className="p-6 text-white">Dados de pedidos em formato inesperado.</div>;
  }

  // Process data for metrics and charts
  const paidOrders = orders.filter(order => order.status === 'PAID');

  const totalRevenue = paidOrders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);
  const totalOrders = paidOrders.length;

  const productSales = paidOrders
    .flatMap(order => order.orderItems || [])
    .reduce((acc: { name: string; total: number }[], item) => {
      const existingProduct = acc.find(p => p.name === item.product.name);
      if (existingProduct) {
        existingProduct.total += item.quantity;
      } else {
        acc.push({ name: item.product.name, total: item.quantity });
      }
      return acc;
    }, [])
    .sort((a, b) => b.total - a.total);

  const salesOverTime = paidOrders
    .reduce((acc: { date: string; revenue: number }[], order) => {
      const date = new Date(order.createdAt).toLocaleDateString('pt-BR');
      const existingDate = acc.find(d => d.date === date);
      if (existingDate) {
        existingDate.revenue += parseFloat(order.totalAmount);
      } else {
        acc.push({ date, revenue: parseFloat(order.totalAmount) });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8">Dashboard Gerencial</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Vendas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Produto Mais Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productSales.length > 0 ? productSales[0].name : 'N/A'}</p>
            <p className="text-gray-400">{productSales.length > 0 ? `${productSales[0].total} unidades` : ''}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700 p-4 text-white">
          <CardHeader>
            <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productSales.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4 text-white">
          <CardHeader>
            <CardTitle>Faturamento Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
