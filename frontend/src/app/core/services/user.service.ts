import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/product.model';
import { UserProfile, UpdateProfileRequest, UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(`${this.baseUrl}/me`, data);
  }

  getAllUsersAdmin(page: number = 0, size: number = 10, search?: string): Observable<ApiResponse<PageResponse<UserResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<PageResponse<UserResponse>>>(this.baseUrl, { params });
  }

  getUserById(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.baseUrl}/${id}`);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
