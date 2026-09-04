import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50/70">
      
      <!-- Ambient light effect -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl"></div>
      </div>

      <!-- Main Login Container -->
      <div class="max-w-md w-full relative z-10 space-y-6">
        
        <!-- Brand Header -->
        <div class="text-center space-y-2">
          <a routerLink="/catalog" class="inline-flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <span class="font-extrabold text-xl tracking-tight text-slate-900">AURA</span>
          </a>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Masuk ke Akun Anda</h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Belum memiliki akun?
            <a routerLink="/register" class="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Daftar sekarang
            </a>
          </p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-ambient-lg">
          <form class="space-y-5" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <!-- Email Input -->
            <div class="space-y-1.5">
              <label for="email-address" class="block text-xs font-bold text-slate-700">Alamat Email</label>
              <div class="relative">
                <input id="email-address" type="email" formControlName="email" autocomplete="email" required
                  placeholder="nama@email.com"
                  class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['email'].errors}">
              </div>
              <div *ngIf="submitted && f['email'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['email'].errors['required']">Email wajib diisi</span>
                <span *ngIf="f['email'].errors['email']">Format alamat email tidak valid</span>
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-xs font-bold text-slate-700">Kata Sandi</label>
                <a routerLink="/forgot-password" class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Lupa kata sandi?
                </a>
              </div>
              <div class="relative">
                <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="current-password" required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  class="w-full pl-3.5 pr-10 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['password'].errors}">
                <button type="button" (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  <svg *ngIf="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                  </svg>
                </button>
              </div>
              <div *ngIf="submitted && f['password'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['password'].errors['required']">Kata sandi wajib diisi</span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button type="submit" [disabled]="isLoading"
                class="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-press">
                <svg *ngIf="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk Sekarang' }}</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Back to Home -->
        <div class="text-center">
          <a routerLink="/catalog" class="text-xs text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Kembali ke Beranda Katalog
          </a>
        </div>

      </div>

    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = false;
  submitted = false;
  showPassword = false;

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.toastService.success('Sukses', 'Berhasil login ke dalam sistem.');
        const user = this.tokenService.getUserInfo();
        const defaultRoute = user?.roles?.includes('ROLE_ADMIN') ? '/admin/dashboard' : '/dashboard';
        const returnUrl = this.route?.snapshot?.queryParams?.['returnUrl'] || defaultRoute;
        this.router.navigate([returnUrl]);
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
