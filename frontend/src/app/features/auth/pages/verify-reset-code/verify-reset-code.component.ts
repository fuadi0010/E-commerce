import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-verify-reset-code',
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
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Verifikasi Kode Reset</h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Masukkan 6 digit kode pemulihan yang telah dikirim ke email:
            <br>
            <span class="font-semibold text-slate-800">{{ targetEmail || 'email Anda' }}</span>
          </p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-ambient-lg">
          <form class="space-y-5" [formGroup]="codeForm" (ngSubmit)="onVerify()">
            
            <!-- Email (Only editable if not prefilled from previous step) -->
            <div *ngIf="!targetEmail" class="space-y-1.5">
              <label for="email" class="block text-xs font-bold text-slate-700">Alamat Email</label>
              <input id="email" type="email" formControlName="email" required
                placeholder="nama@email.com"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
            </div>

            <!-- 6-digit Code Input -->
            <div class="space-y-2">
              <label for="code" class="block text-xs font-bold text-slate-700 text-center">Kode Reset 6 Digit</label>
              <div class="relative">
                <input id="code" type="text" formControlName="code" maxlength="6" autocomplete="one-time-code"
                  placeholder="• • • • • •"
                  (input)="onCodeInput($event)"
                  class="w-full py-3.5 px-4 text-center tracking-[0.6em] text-2xl font-mono font-bold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['code'].errors}">
              </div>
              <div *ngIf="submitted && f['code'].errors" class="text-rose-600 text-[11px] font-medium text-center pt-0.5">
                <span *ngIf="f['code'].errors['required']">Kode reset wajib diisi</span>
                <span *ngIf="f['code'].errors['pattern']">Kode reset harus berupa 6 digit angka</span>
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
                <span>{{ isLoading ? 'Memverifikasi...' : 'Verifikasi Kode' }}</span>
              </button>
            </div>

            <!-- Resend Section -->
            <div class="pt-2 text-center border-t border-slate-100">
              <p class="text-xs text-slate-500">
                Tidak menerima kode?
                <button type="button" (click)="onResend()" [disabled]="isResending || resendCountdown > 0"
                  class="font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-1">
                  <span *ngIf="resendCountdown > 0">Kirim ulang dalam {{ resendCountdown }}s</span>
                  <span *ngIf="resendCountdown === 0">{{ isResending ? 'Mengirim...' : 'Kirim Ulang Kode' }}</span>
                </button>
              </p>
            </div>

          </form>
        </div>

        <!-- Navigation Links -->
        <div class="flex justify-between items-center text-xs text-slate-500 px-2">
          <a routerLink="/forgot-password" class="hover:text-slate-800 transition-colors">
            &larr; Ubah Email
          </a>
          <a routerLink="/login" class="hover:text-slate-800 transition-colors">
            Ingat Sandi? Masuk &rarr;
          </a>
        </div>

      </div>

    </div>
  `
})
export class VerifyResetCodeComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  targetEmail = '';
  isLoading = false;
  isResending = false;
  submitted = false;
  resendCountdown = 60;
  private timerRef: any = null;

  codeForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  get f() { return this.codeForm.controls; }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.targetEmail = params['email'];
        this.codeForm.patchValue({ email: this.targetEmail });
      }
    });

    this.startCooldown();
  }

  ngOnDestroy(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
    }
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.codeForm.patchValue({ code: input.value });
  }

  startCooldown(): void {
    this.resendCountdown = 60;
    if (this.timerRef) {
      clearInterval(this.timerRef);
    }
    this.timerRef = setInterval(() => {
      if (this.resendCountdown > 0) {
        this.resendCountdown--;
      } else {
        clearInterval(this.timerRef);
      }
    }, 1000);
  }

  onVerify(): void {
    this.submitted = true;

    if (this.codeForm.invalid) {
      return;
    }

    const formVal = this.codeForm.value;
    const payload = {
      email: formVal.email!.trim(),
      code: formVal.code!.trim()
    };

    this.isLoading = true;
    this.authService.verifyResetCode(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success(
          'Kode Terverifikasi',
          res?.message || 'Kode reset berhasil diverifikasi. Silakan masukkan password baru.'
        );
        const resetToken = res.data?.resetToken;
        if (resetToken) {
          this.router.navigate(['/reset-password'], { queryParams: { token: resetToken } });
        } else {
          this.toastService.error('Error', 'Token reset password tidak ditemukan dalam respon.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Verifikasi gagal. Pastikan kode reset benar.';
        this.toastService.error('Verifikasi Gagal', msg);
      }
    });
  }

  onResend(): void {
    const email = this.codeForm.get('email')?.value || this.targetEmail;
    if (!email) {
      this.toastService.error('Error', 'Alamat email wajib diisi untuk kirim ulang kode.');
      return;
    }

    this.isResending = true;
    this.authService.forgotPassword(email.trim()).subscribe({
      next: (res) => {
        this.isResending = false;
        this.toastService.success('Kode Terkirim', res?.message || 'Kode reset baru telah dikirimkan ke email Anda.');
        this.startCooldown();
      },
      error: (err) => {
        this.isResending = false;
        const msg = err?.error?.message || err?.message || 'Gagal mengirim ulang kode reset.';
        this.toastService.error('Gagal Mengirim Kode', msg);
      }
    });
  }
}
