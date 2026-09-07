import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/product.model';
import {
  ReviewResponse,
  ProductRatingSummary,
  CreateReviewRequest,
  UpdateReviewRequest
} from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  getReviewsByProduct(productId: string, page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<ReviewResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<ReviewResponse>>>(`${this.apiUrl}/product/${productId}`, { params });
  }

  getProductRatingSummary(productId: string): Observable<ApiResponse<ProductRatingSummary>> {
    return this.http.get<ApiResponse<ProductRatingSummary>>(`${this.apiUrl}/product/${productId}/summary`);
  }

  getMyReviews(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<ReviewResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<ReviewResponse>>>(`${this.apiUrl}/my-reviews`, { params });
  }

  createReview(request: CreateReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.http.post<ApiResponse<ReviewResponse>>(this.apiUrl, request);
  }

  updateReview(id: string, request: UpdateReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.http.put<ApiResponse<ReviewResponse>>(`${this.apiUrl}/${id}`, request);
  }

  deleteReview(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getAllReviewsAdmin(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<ReviewResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<ReviewResponse>>>(`${this.apiUrl}/admin`, { params });
  }
}
