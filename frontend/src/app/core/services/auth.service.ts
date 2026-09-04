import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserInfo, ResetPasswordRequest } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { TokenService } from './token.service';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor() {}

  register(data: any): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/register`, data);
  }

  login(data: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, data).pipe(
      tap(response => {
        if (response.data) {
          this.tokenService.saveTokens(response.data.accessToken, response.data.refreshToken);
        }
      })
    );
  }

  logout(): Observable<ApiResponse<null>> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.tokenService.clearTokens();
      }),
      catchError(error => {
        // Hapus token lokal meskipun request ke server gagal
        this.tokenService.clearTokens();
        return throwError(() => error);
      })
    );
  }

  refreshToken(token: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh`, { refreshToken: token }).pipe(
      tap(response => {
        if (response.data) {
          this.tokenService.saveTokens(response.data.accessToken, response.data.refreshToken);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/reset-password`, data);
  }
}
