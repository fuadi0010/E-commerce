import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Product, PageResponse, ProductSearchRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  searchProducts(request: ProductSearchRequest): Observable<ApiResponse<PageResponse<Product>>> {
    let params = new HttpParams();
    
    if (request.name) params = params.set('search', request.name);
    if (request.categoryId) params = params.set('categoryId', request.categoryId);
    if (request.page !== undefined) params = params.set('page', request.page);
    if (request.size !== undefined) params = params.set('size', request.size);

    // Rule 53: Translate sort options to Spring Sort strings
    if (request.sortBy) {
      switch (request.sortBy) {
        case 'newest':
          params = params.set('sort', 'createdAt,desc');
          break;
        case 'oldest':
          params = params.set('sort', 'createdAt,asc');
          break;
        case 'priceAsc':
          params = params.set('sort', 'price,asc');
          break;
        case 'priceDesc':
          params = params.set('sort', 'price,desc');
          break;
        case 'nameAsc':
          params = params.set('sort', 'name,asc');
          break;
        case 'nameDesc':
          params = params.set('sort', 'name,desc');
          break;
      }
    }

    return this.http.get<ApiResponse<PageResponse<Product>>>(this.apiUrl, { params });
  }

  getProducts(params?: any): Observable<ApiResponse<PageResponse<Product>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
      if (params.name) httpParams = httpParams.set('search', params.name);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    }
    return this.http.get<ApiResponse<PageResponse<Product>>>(this.apiUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  createProduct(request: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, request);
  }

  updateProduct(id: string, request: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, request);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
