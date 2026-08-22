export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
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
