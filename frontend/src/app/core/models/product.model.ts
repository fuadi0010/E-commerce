export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductSearchRequest {
  name?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string; // 'newest', 'priceAsc', 'priceDesc'
  page?: number;
  size?: number;
}
