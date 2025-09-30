export interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryId: string;
  isSoldOut: boolean;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: Product;
}

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | 'PAID';

export interface IOrder {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface IWristbandWithDetails {
  id: string;
  code: string;
  orders: IOrder[];
}
