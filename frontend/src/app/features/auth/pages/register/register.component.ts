import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50/70">
      
      <!-- Ambient light effect -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl"></div>
      </div>

      <!-- Main Container -->
      <div class="max-w-lg w-full relative z-10 space-y-6">
        
        <!-- Brand Header -->
        <div class="text-center space-y-2">
          <a routerLink="/catalog" class="inline-flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <span class="font-extrabold text-xl tracking-tight text-slate-900">AURA</span>
          </a>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Akun Baru</h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Sudah memiliki akun?
            <a routerLink="/login" class="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Masuk di sini
            </a>
          </p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-ambient-lg">
          <form class="space-y-4" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label for="name" class="block text-xs font-bold text-slate-700">Nama Lengkap</label>
              <input id="name" type="text" formControlName="name" required
                placeholder="cth. Budi Santoso"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['name'].errors}">
              <div *ngIf="submitted && f['name'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Nama lengkap wajib diisi
              </div>
            </div>

            <!-- Email Address -->
            <div class="space-y-1.5">
              <label for="email-address" class="block text-xs font-bold text-slate-700">Alamat Email</label>
              <input id="email-address" type="email" formControlName="email" autocomplete="email" required
                placeholder="nama@email.com"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['email'].errors}">
              <div *ngIf="submitted && f['email'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['email'].errors['required']">Email wajib diisi</span>
                <span *ngIf="f['email'].errors['email']">Format alamat email tidak valid</span>
              </div>
            </div>

            <!-- Phone Number -->
            <div class="space-y-1.5">
              <label for="phone" class="block text-xs font-bold text-slate-700">Nomor Telepon (Opsional)</label>
              <input id="phone" type="tel" formControlName="phoneNumber"
                placeholder="+628123456789"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
            </div>

            <!-- Password & Confirm Password (Grid) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Password -->
              <div class="space-y-1.5">
                <label for="password" class="block text-xs font-bold text-slate-700">Kata Sandi</label>
                <div class="relative">
                  <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" required
                    placeholder="Min. 8 karakter"
                    class="w-full pl-3.5 pr-8 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                    [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['password'].errors}">
                </div>
                <div *ngIf="submitted && f['password'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                  <span *ngIf="f['password'].errors['required']">Kata sandi wajib diisi</span>
                  <span *ngIf="f['password'].errors['minlength']">Minimal 8 karakter</span>
                  <span *ngIf="f['password'].errors['pattern']">Wajib mengandung minimal 1 angka dan 1 huruf kapital</span>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="space-y-1.5">
                <label for="confirmPassword" class="block text-xs font-bold text-slate-700">Ulangi Sandi</label>
                <input id="confirmPassword" [type]="showPassword ? 'text' : 'password'" formControlName="confirmPassword" required
                  placeholder="Ulangi sandi"
                  class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && (f['confirmPassword'].errors || registerForm.hasError('passwordMismatch'))}">
                <div *ngIf="submitted" class="text-rose-600 text-[11px] font-medium pt-0.5">
                  <span *ngIf="f['confirmPassword'].errors?.['required']">Konfirmasi sandi wajib diisi</span>
                  <span *ngIf="registerForm.hasError('passwordMismatch')">Kata sandi tidak cocok</span>
                </div>
              </div>

            </div>

            <!-- Show Password Toggle -->
            <div class="flex items-center gap-2 pt-1">
              <input id="show-pwd" type="checkbox" (change)="showPassword = !showPassword" 
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
              <label for="show-pwd" class="text-xs text-slate-500 cursor-pointer">Lihat kata sandi</label>
            </div>

            <!-- Submit Button -->
            <div class="pt-3">
              <button type="submit" [disabled]="isLoading"
                class="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-press">
                <svg *ngIf="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang' }}</span>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z]).{8,}$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  isLoading = false;
  submitted = false;
  showPassword = false;

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    const formVal = this.registerForm.value;
    const payload = {
      fullName: formVal.name,
      email: formVal.email,
      password: formVal.password,
      passwordConfirmation: formVal.confirmPassword,
      phoneNumber: formVal.phoneNumber || null
    };

    this.isLoading = true;
    this.authService.register(payload).subscribe({
      next: () => {
        this.toastService.success('Registrasi Berhasil', 'Akun Anda berhasil dibuat. Silakan login.');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.error?.errors && typeof err.error.errors === 'object') {
          const fieldErrors = Object.values(err.error.errors) as string[];
          if (fieldErrors.length > 0) {
            this.toastService.error('Validasi Gagal', fieldErrors.join('. '));
            return;
          }
        }
        const errorMsg = err?.error?.message || err?.message || 'Registrasi gagal. Silakan periksa data Anda.';
        this.toastService.error('Registrasi Gagal', errorMsg);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
