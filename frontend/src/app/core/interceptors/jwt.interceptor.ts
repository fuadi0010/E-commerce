import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

let isRefreshing = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const token = tokenService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Global Error Handling
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        // Coba refresh token
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = tokenService.getRefreshToken();
          
          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              switchMap((res) => {
                isRefreshing = false;
                // Ulangi request asli dengan token baru
                const newToken = tokenService.getAccessToken();
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(newReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                tokenService.clearTokens();
                router.navigate(['/login']);
                toastService.error('Sesi Berakhir', 'Sesi Anda telah berakhir. Silakan login kembali.');
                return throwError(() => refreshError);
              })
            );
          } else {
            isRefreshing = false;
            tokenService.clearTokens();
            router.navigate(['/login']);
          }
        }
      } else {
        // Tampilkan pesan error global jika bukan 401
        let errorMessage = 'Terjadi kesalahan sistem.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Hindari nampilin toast berlebihan jika request dari guard
        if(!req.url.includes('/auth/refresh')) {
           toastService.error('Error', errorMessage);
        }
      }
      
      return throwError(() => error);
    })
  );
};
