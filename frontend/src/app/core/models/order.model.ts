export interface CartItem {
  product: import('./product.model').Product;
  quantity: number;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItemRequest[];
  paymentMethod?: string;
  paymentProofUrl?: string;
}

export interface OrderItemResponse {
  id: string;
  product: import('./product.model').Product;
  quantity: number;
  priceAtTime: number;
  subTotal: number;
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentProofUrl?: string;
  createdAt: string;
  items: OrderItemResponse[];
}
