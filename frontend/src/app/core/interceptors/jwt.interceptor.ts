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
      // =============================
      // 401 Unauthorized — coba refresh
      // =============================
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = tokenService.getRefreshToken();

          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              switchMap((res) => {
                isRefreshing = false;
                const newToken = tokenService.getAccessToken();
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(newReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                tokenService.clearTokens();
                router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
                toastService.error('Sesi Berakhir', 'Sesi Anda telah berakhir. Silakan login kembali.');
                return throwError(() => refreshError);
              })
            );
          } else {
            isRefreshing = false;
            tokenService.clearTokens();
            // Hindari redirect berulang jika sudah di halaman 401 atau login
            if (!router.url.includes('/401') && !router.url.includes('/login')) {
              router.navigate(['/401']);
            }
            return throwError(() => error);
          }
        } else {
          return throwError(() => error);
        }
      }
      // =============================
      // 403 Forbidden — Rule 57
      // =============================
      else if (error.status === 403) {
        if (!router.url.includes('/403')) {
          router.navigate(['/403']);
        }
        return throwError(() => error);
      }
      // =============================
      // 500 Server Error
      // Tampilkan notifikasi non-intrusif (toast), jangan redirect paksa agar tidak terjadi infinite loop UX
      // =============================
      else if (error.status >= 500) {
        const errorMessage = error.error?.message || 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
        toastService.error('Kesalahan Server', errorMessage);
        return throwError(() => error);
      }
      else {
        // Tampilkan pesan error global untuk error lainnya
        let errorMessage = 'Terjadi kesalahan sistem.';
        if (error.error && error.error.errors && typeof error.error.errors === 'object') {
          const detailErrors = Object.values(error.error.errors) as string[];
          if (detailErrors.length > 0) {
            errorMessage = detailErrors.join('. ');
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Jangan tampilkan toast untuk endpoint yang sudah memiliki handler spesifik di component
        if (!req.url.includes('/auth/refresh') && !req.url.includes('/auth/register')) {
          toastService.error('Error', errorMessage);
        }
      }

      return throwError(() => error);
    })
  );
};
