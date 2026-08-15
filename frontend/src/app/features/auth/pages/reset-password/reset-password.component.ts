import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Please enter your new password below.
          </p>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm flex flex-col gap-4">
            
            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <input id="newPassword" type="password" formControlName="newPassword" required
                class="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="********"
                [ngClass]="{'border-red-500': submitted && f['newPassword'].errors}">
              <div *ngIf="submitted && f['newPassword'].errors" class="text-red-500 text-xs mt-1">
                <div *ngIf="f['newPassword'].errors['required']">Password is required</div>
                <div *ngIf="f['newPassword'].errors['minlength']">Password must be at least 8 characters</div>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input id="confirmPassword" type="password" formControlName="confirmPassword" required
                class="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="********"
                [ngClass]="{'border-red-500': submitted && (f['confirmPassword'].errors || resetForm.hasError('passwordMismatch'))}">
              <div *ngIf="submitted" class="text-red-500 text-xs mt-1">
                <div *ngIf="f['confirmPassword'].errors?.['required']">Please confirm your password</div>
                <div *ngIf="resetForm.hasError('passwordMismatch')">Passwords do not match</div>
              </div>
            </div>

          </div>

          <div>
            <button type="submit" [disabled]="isLoading || !token"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>
          
          <div *ngIf="!token" class="mt-2 text-center text-sm text-red-500">
            Invalid or missing reset token.
          </div>
        </form>
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
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  get f() { return this.resetForm.controls; }

  ngOnInit() {
    // Ambil token dari URL query params ?token=xxxx
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

    const payload = {
      token: this.token,
      newPassword: this.resetForm.value.newPassword
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
