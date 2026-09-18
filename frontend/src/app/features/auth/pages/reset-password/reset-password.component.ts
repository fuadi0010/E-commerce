import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../../core/models/auth.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50/70">
      
      <!-- Ambient light effect -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl"></div>
      </div>

      <!-- Main Container -->
      <div class="max-w-md w-full relative z-10 space-y-6">
        
        <!-- Brand Header -->
        <div class="text-center space-y-2">
          <a routerLink="/catalog" class="inline-flex items-center gap-2.5 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 36 36" fill="none" class="w-full h-full">
                <path d="M12 11V8C12 4.686 14.686 2 18 2C21.314 2 24 4.686 24 8V11" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
                <rect x="5" y="10" width="26" height="22" rx="5" fill="white" fill-opacity="0.2" />
                <path d="M12 16C12 19.314 14.686 22 18 22C21.314 22 24 19.314 24 16" stroke="white" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
                <path d="M26 6L27.2 9.8L31 11L27.2 12.2L26 16L24.8 12.2L21 11L24.8 9.8L26 6Z" fill="#F59E0B" />
              </svg>
            </div>
            <div class="flex flex-col text-left">
              <span class="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">AURA</span>
              <span class="text-[9px] tracking-widest text-slate-500 uppercase font-bold -mt-1">Borkat Serba Ada</span>
            </div>
          </a>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Atur Ulang Kata Sandi</h1>
          <p class="text-xs sm:text-sm text-slate-500">
            {{ token ? 'Sesi verifikasi terkonfirmasi. Silakan tentukan kata sandi baru Anda.' : 'Silakan lengkapi data di bawah untuk mengatur ulang kata sandi Anda.' }}
          </p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-ambient-lg">
          <form class="space-y-4" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            
            <!-- Mode A Banner: Token verified session -->
            <div *ngIf="token" class="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
              <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Kode reset telah terverifikasi. Masukkan kata sandi baru Anda di bawah.</span>
            </div>

            <!-- Mode B Inputs: Direct Reset with Email and OTP Code -->
            <ng-container *ngIf="!token">
              <!-- Notice banner -->
              <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-indigo-900 text-xs">
                <svg class="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span class="font-semibold">Reset Langsung:</span> Masukkan email terdaftar dan 6 digit kode reset yang telah dikirim ke email Anda.
                </div>
              </div>

              <!-- Email Field -->
              <div class="space-y-1.5">
                <label for="email" class="block text-xs font-bold text-slate-700">Alamat Email</label>
                <input id="email" type="email" formControlName="email"
                  placeholder="nama@email.com"
                  class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['email'].errors}">
                <div *ngIf="submitted && f['email'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                  <span *ngIf="f['email'].errors['required']">Email wajib diisi</span>
                  <span *ngIf="f['email'].errors['email']">Format email tidak valid</span>
                </div>
              </div>

              <!-- Reset Code Field -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="resetCode" class="block text-xs font-bold text-slate-700">Kode Reset (OTP 6 Digit)</label>
                  <a routerLink="/forgot-password" class="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    Minta Kode Baru &rarr;
                  </a>
                </div>
                <input id="resetCode" type="text" formControlName="resetCode" maxlength="6" (input)="onResetCodeInput($event)"
                  placeholder="Contoh: 123456"
                  class="w-full px-3.5 py-2.5 text-xs tracking-widest font-mono text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['resetCode'].errors}">
                <div *ngIf="submitted && f['resetCode'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                  <span *ngIf="f['resetCode'].errors['required']">Kode reset wajib diisi</span>
                  <span *ngIf="f['resetCode'].errors['pattern']">Kode harus berupa 6 digit angka</span>
                </div>
              </div>
            </ng-container>

            <!-- New Password -->
            <div class="space-y-1.5">
              <label for="newPassword" class="block text-xs font-bold text-slate-700">Kata Sandi Baru</label>
              <div class="relative">
                <input id="newPassword" [type]="showNewPassword ? 'text' : 'password'" formControlName="newPassword" required
                  placeholder="Minimal 8 karakter, 1 huruf besar, 1 angka"
                  class="w-full pl-3.5 pr-10 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['newPassword'].errors}">
                <button type="button" (click)="toggleNewPassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <svg *ngIf="!showNewPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showNewPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                </button>
              </div>
              <div *ngIf="submitted && f['newPassword'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['newPassword'].errors['required']">Kata sandi wajib diisi</span>
                <span *ngIf="f['newPassword'].errors['minlength']">Minimal 8 karakter</span>
                <span *ngIf="f['newPassword'].errors['pattern']">Harus mengandung minimal 1 angka dan 1 huruf besar</span>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
              <label for="confirmPassword" class="block text-xs font-bold text-slate-700">Ulangi Kata Sandi</label>
              <div class="relative">
                <input id="confirmPassword" [type]="showConfirmPassword ? 'text' : 'password'" formControlName="confirmPassword" required
                  placeholder="Ulangi sandi baru"
                  class="w-full pl-3.5 pr-10 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && (f['confirmPassword'].errors || resetForm.hasError('passwordMismatch'))}">
                <button type="button" (click)="toggleConfirmPassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <svg *ngIf="!showConfirmPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showConfirmPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                </button>
              </div>
              <div *ngIf="submitted" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['confirmPassword'].errors?.['required']">Konfirmasi kata sandi wajib diisi</span>
                <span *ngIf="resetForm.hasError('passwordMismatch')">Kata sandi tidak cocok</span>
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
                <span>{{ isLoading ? 'Menyimpan Kata Sandi...' : 'Simpan Kata Sandi Baru' }}</span>
              </button>
            </div>

            <div class="text-center pt-2 space-y-1">
              <div *ngIf="!token">
                <a routerLink="/verify-reset-code" class="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                  Punya kode dan ingin verifikasi terpisah? Klik di sini
                </a>
              </div>
              <div>
                <a routerLink="/login" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  &larr; Kembali ke Halaman Masuk
                </a>
              </div>
            </div>

          </form>
        </div>

      </div>

    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  token: string | null = null;
  isLoading = false;
  submitted = false;
  showNewPassword = false;
  showConfirmPassword = false;

  resetForm = this.fb.group({
    email: [''],
    resetCode: [''],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z]).{8,}$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  get f() { return this.resetForm.controls; }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      const emailParam = params['email'];
      if (emailParam) {
        this.resetForm.patchValue({ email: emailParam });
      }

      if (!this.token) {
        this.resetForm.get('email')?.setValidators([Validators.required, Validators.email]);
        this.resetForm.get('resetCode')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{6}$/)]);
      } else {
        this.resetForm.get('email')?.clearValidators();
        this.resetForm.get('resetCode')?.clearValidators();
      }
      this.resetForm.get('email')?.updateValueAndValidity();
      this.resetForm.get('resetCode')?.updateValueAndValidity();
    });
  }

  onResetCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.resetForm.patchValue({ resetCode: input.value });
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid) {
      return;
    }

    const rawValues = this.resetForm.getRawValue();
    const payload: ResetPasswordRequest = {
      newPassword: rawValues.newPassword || '',
      confirmPassword: rawValues.confirmPassword || ''
    };

    if (this.token) {
      payload.token = this.token;
    } else {
      payload.email = rawValues.email ? rawValues.email.trim().toLowerCase() : '';
      payload.resetCode = rawValues.resetCode ? rawValues.resetCode.trim() : '';
    }

    this.isLoading = true;
    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Kata Sandi Berhasil Diperbarui', 'Silakan masuk menggunakan kata sandi baru Anda.');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Gagal mengatur ulang kata sandi. Silakan periksa kembali data Anda.';
        this.toastService.error('Reset Password Gagal', msg);
      }
    });
  }
}
