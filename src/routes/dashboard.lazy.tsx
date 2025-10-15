import { createLazyFileRoute } from '@tanstack/react-router';
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useSalesByTable } from '../hooks/useSalesByTable';
import { useSalesByPaymentMethod } from '../hooks/useSalesByPaymentMethod';
import { useProductPerformance } from '../hooks/useProductPerformance';
import { useSalesOverTime } from '../hooks/useSalesOverTime';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const Route = createLazyFileRoute('/dashboard')({
  component: Dashboard,
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${payload.name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

function Dashboard() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const { data: salesByTable, isLoading: isLoadingSalesByTable } = useSalesByTable(period);
  const { data: salesByPaymentMethod, isLoading: isLoadingSalesByPayment } = useSalesByPaymentMethod(period);
  const { data: productPerformance, isLoading: isLoadingProductPerformance } = useProductPerformance(period);
  const { data: salesOverTime, isLoading: isLoadingSalesOverTime } = useSalesOverTime(period);

  const isLoading = isLoadingSalesByTable || isLoadingSalesByPayment || isLoadingProductPerformance || isLoadingSalesOverTime;

  const totalRevenue = salesByPaymentMethod?.reduce((acc, item) => acc + item.total, 0) || 0;

  const formatCurrency = (value: number) => `R$ ${Number(value).toFixed(2)}`;

  if (isLoading) {
    return <div className="p-6 text-white">Carregando dados do dashboard...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">Dashboard Gerencial</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setPeriod('week')} variant={period === 'week' ? 'secondary' : 'outline'}>Últimos 7 dias</Button>
          <Button onClick={() => setPeriod('month')} variant={period === 'month' ? 'secondary' : 'outline'}>Últimos 30 dias</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Faturamento Total (Pedidos Pagos)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        {/* Other metric cards can be added here */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700 p-4 text-white">
          <CardHeader>
            <CardTitle>Faturamento por Mesa</CardTitle>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByTable}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="tableNumber" name="Mesa" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={formatCurrency} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Faturamento" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4 text-white">
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={salesByPaymentMethod} 
                  dataKey="total" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={120} 
                  fill="#8884d8" 
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {salesByPaymentMethod?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4 text-white col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={formatCurrency} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4 text-white col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 Produtos Vendidos (por Faturamento)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productPerformance?.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" stroke="#888" tickFormatter={formatCurrency} />
                <YAxis type="category" dataKey="productName" stroke="#888" width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#82ca9d" name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
