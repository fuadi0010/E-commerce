import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderRequest, OrderResponse } from '../models/order.model';
import { PageResponse } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  checkout(request: OrderRequest): Observable<ApiResponse<OrderResponse>> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.apiUrl}/checkout`, request);
  }

  getMyOrders(page: number = 0, size: number = 10, status?: string): Observable<ApiResponse<PageResponse<OrderResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status && status.trim() !== '' && status !== 'ALL') {
      params = params.set('status', status);
    }
      
    return this.http.get<ApiResponse<PageResponse<OrderResponse>>>(`${this.apiUrl}/my-orders`, { params });
  }

  getAllOrdersAdmin(
    page: number = 0,
    size: number = 10,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<PageResponse<OrderResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status && status.trim() !== '' && status !== 'ALL') {
      params = params.set('status', status);
    }
    if (startDate && startDate.trim() !== '') {
      params = params.set('startDate', startDate);
    }
    if (endDate && endDate.trim() !== '') {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<PageResponse<OrderResponse>>>(`${this.apiUrl}/admin`, { params });
  }

  getOrderById(id: string): Observable<ApiResponse<OrderResponse>> {
    return this.http.get<ApiResponse<OrderResponse>>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<ApiResponse<OrderResponse>> {
    return this.http.patch<ApiResponse<OrderResponse>>(`${this.apiUrl}/${id}/status`, { status });
  }
}
