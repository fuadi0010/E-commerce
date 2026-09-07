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
            Silakan masukkan kata sandi baru untuk mengamankan akun Anda.
          </p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-ambient-lg">
          <form class="space-y-4" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            
            <!-- New Password -->
            <div class="space-y-1.5">
              <label for="newPassword" class="block text-xs font-bold text-slate-700">Kata Sandi Baru</label>
              <input id="newPassword" type="password" formControlName="newPassword" required
                placeholder="Minimal 8 karakter, 1 huruf besar, 1 angka"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['newPassword'].errors}">
              <div *ngIf="submitted && f['newPassword'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['newPassword'].errors['required']">Kata sandi wajib diisi</span>
                <span *ngIf="f['newPassword'].errors['minlength']">Minimal 8 karakter</span>
                <span *ngIf="f['newPassword'].errors['pattern']">Harus mengandung minimal 1 angka dan 1 huruf besar</span>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
              <label for="confirmPassword" class="block text-xs font-bold text-slate-700">Ulangi Kata Sandi</label>
              <input id="confirmPassword" type="password" formControlName="confirmPassword" required
                placeholder="Ulangi sandi baru"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && (f['confirmPassword'].errors || resetForm.hasError('passwordMismatch'))}">
              <div *ngIf="submitted" class="text-rose-600 text-[11px] font-medium pt-0.5">
                <span *ngIf="f['confirmPassword'].errors?.['required']">Konfirmasi kata sandi wajib diisi</span>
                <span *ngIf="resetForm.hasError('passwordMismatch')">Kata sandi tidak cocok</span>
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="isLoading || !token"
                class="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-press">
                <svg *ngIf="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi Baru' }}</span>
              </button>
            </div>

            <div *ngIf="!token" class="mt-2 text-center text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              Token reset sandi tidak ditemukan atau sudah kedaluwarsa.
            </div>

            <div class="text-center pt-2">
              <a routerLink="/login" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                &larr; Kembali ke Halaman Masuk
              </a>
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

  resetForm = this.fb.group({
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
      this.token = params['token'];
      if (!this.token) {
        this.toastService.error('Error', 'Token reset password tidak valid atau tidak ditemukan.');
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid || !this.token) {
      return;
    }

    const rawValues = this.resetForm.getRawValue();
    const payload: ResetPasswordRequest = {
      token: this.token,
      newPassword: rawValues.newPassword || '',
      confirmPassword: rawValues.confirmPassword || ''
    };

    this.isLoading = true;
    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.toastService.success('Sukses', 'Password Anda berhasil direset. Silakan login.');
        this.router.navigate(['/login']); 
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
