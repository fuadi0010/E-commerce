import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { UserProfile, UpdateProfileRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- Page Header -->
      <div class="pb-4 border-b border-slate-200/80">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Kelola informasi data diri dan kontak akun Anda</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoadingProfile" class="flex justify-center my-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Profile Container -->
      <div *ngIf="!isLoadingProfile && profileForm" class="bg-white rounded-3xl border border-slate-200/80 shadow-ambient p-6 sm:p-8 space-y-6">
        
        <!-- User Avatar Header Info -->
        <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xl flex items-center justify-center">
            {{ userInitial }}
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900">{{ userProfile?.fullName || userProfile?.name || 'Member Pengguna' }}</h2>
            <p class="text-xs text-slate-500 font-mono">{{ userProfile?.email }}</p>
            <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              Akun Terverifikasi
            </span>
          </div>
        </div>

        <!-- Form Fields -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-5">
          
          <!-- Email (Read Only) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700">Alamat Email</label>
              <span class="text-[10px] font-medium text-slate-400">Tidak dapat diubah</span>
            </div>
            <input type="email" [value]="userProfile?.email" disabled
              class="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label for="fullName" class="block text-xs font-bold text-slate-700">Nama Lengkap</label>
              <input id="fullName" type="text" formControlName="fullName"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="{'border-rose-400 focus:ring-rose-100 focus:border-rose-400': submitted && f['fullName'].errors}">
              <div *ngIf="submitted && f['fullName'].errors" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Nama lengkap wajib diisi
              </div>
            </div>

            <!-- Phone Number -->
            <div class="space-y-1.5">
              <label for="phone" class="block text-xs font-bold text-slate-700">Nomor Telepon</label>
              <input id="phone" type="tel" formControlName="phone"
                placeholder="+628123456789 atau 08123456789"
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all">
            </div>

          </div>

          <!-- Address Field -->
          <div class="space-y-1.5">
            <label for="address" class="block text-xs font-bold text-slate-700">Alamat Lengkap</label>
            <textarea id="address" formControlName="address" rows="3"
              placeholder="Masukkan alamat lengkap (jalan, nomor rumah, RT/RW, kota, provinsi, kode pos)..."
              class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"></textarea>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" [disabled]="isSaving"
              class="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 btn-press">
              <svg *ngIf="isSaving" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: [''],
    address: ['']
  });

  userProfile: UserProfile | null = null;
  isLoadingProfile = true;
  isSaving = false;
  submitted = false;

  get f() { return this.profileForm.controls; }

  get userInitial(): string {
    const name = this.userProfile?.fullName || this.userProfile?.name;
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoadingProfile = true;
    this.userService.getProfile().subscribe({
      next: (response) => {
        if (response.data) {
          this.userProfile = response.data;
          this.profileForm.patchValue({
            fullName: this.userProfile.fullName || this.userProfile.name || '',
            phone: this.userProfile.phone || this.userProfile.phoneNumber || '',
            address: this.userProfile.address || ''
          });
        }
      },
      error: () => {
        this.isLoadingProfile = false;
        this.toastService.error('Gagal', 'Gagal memuat profil pengguna');
      },
      complete: () => {
        this.isLoadingProfile = false;
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    const formVal = this.profileForm.value;
    const requestPayload: UpdateProfileRequest = {
      fullName: (formVal.fullName || '').trim(),
      phone: (formVal.phone || '').trim(),
      address: (formVal.address || '').trim()
    };

    this.userService.updateProfile(requestPayload).subscribe({
      next: (response) => {
        this.toastService.success('Sukses', 'Profil berhasil diperbarui!');
        if (response.data) {
          this.userProfile = response.data;
          this.profileForm.patchValue({
            fullName: this.userProfile.fullName || this.userProfile.name || '',
            phone: this.userProfile.phone || this.userProfile.phoneNumber || '',
            address: this.userProfile.address || ''
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err.error?.message || 'Gagal memperbarui profil.';
        this.toastService.error('Gagal', msg);
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}
