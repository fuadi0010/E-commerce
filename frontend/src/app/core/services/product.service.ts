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

  // Untuk filter kategori, ambil semua kategori publik
  getCategories(): Observable<ApiResponse<Category[]>> {
    // Kalau backend belum punya /categories/public, ini mungkin error. 
    // Saya akan siapkan endpointnya jika belum ada di backend, atau sementara bypass.
    // Tapi backend sudah memiliki CategoryController sebelumnya, semoga bisa diakses.
    // Jika auth required, kita perlu mengubah backend. Tapi public = harus public.
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`); 
    // Catatan: Jika GET /api/v1/categories butuh auth, maka frontend filter akan error saat belum login.
    // Tapi kita bisa coba dulu.
  }
}
