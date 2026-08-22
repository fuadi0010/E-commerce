import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Product, PageResponse, ProductSearchRequest, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products/public`;
  private categoryUrl = `${environment.apiUrl}/categories/public`; // Asumsi ada endpoint ini untuk ambil kategori

  constructor() {}

  searchProducts(request: ProductSearchRequest): Observable<ApiResponse<PageResponse<Product>>> {
    let params = new HttpParams();
    
    if (request.name) params = params.set('name', request.name);
    if (request.categoryId) params = params.set('categoryId', request.categoryId);
    if (request.minPrice) params = params.set('minPrice', request.minPrice);
    if (request.maxPrice) params = params.set('maxPrice', request.maxPrice);
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.page !== undefined) params = params.set('page', request.page);
    if (request.size !== undefined) params = params.set('size', request.size);

    return this.http.get<ApiResponse<PageResponse<Product>>>(this.baseUrl, { params });
  }

  getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/${slug}`);
  }

  // Admin methods
  private adminUrl = `${environment.apiUrl}/products`;

  getProducts(params?: any): Observable<ApiResponse<PageResponse<Product>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    }
    return this.http.get<ApiResponse<PageResponse<Product>>>(this.adminUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.adminUrl}/${id}`);
  }

  createProduct(request: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.adminUrl, request);
  }

  updateProduct(id: string, request: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.adminUrl}/${id}`, request);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/${id}`);
  }
}
