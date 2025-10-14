export interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryId: string;
  isSoldOut: boolean;
  stock: number | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface ITable {
  id: string;
  tableNumber: number;
  isActive: boolean;
}

export interface Session {
  id: string;
  tableId: string;
  status: 'ACTIVE' | 'CLOSED';
}

export interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: string;
  product: Product;
}

export interface IOrder {
  id: string;
  totalAmount: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface ISessionDetails extends Session {
  table: ITable;
  orders: IOrder[];
}