import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { UserProfile } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow-sm rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div class="px-6 py-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">User Profile</h2>

        <div *ngIf="isLoadingProfile" class="flex justify-center my-8">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <form *ngIf="!isLoadingProfile && profileForm" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Email (Read Only) -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Email Address (Read-only)</label>
              <input type="email" [value]="userProfile?.email" disabled
                class="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed sm:text-sm">
            </div>

            <!-- Full Name -->
            <div class="md:col-span-1">
              <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
              <input id="name" type="text" formControlName="name"
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                [ngClass]="{'border-red-500': submitted && f['name'].errors}">
              <div *ngIf="submitted && f['name'].errors" class="text-red-500 text-xs mt-1">
                Name is required
              </div>
            </div>

            <!-- Phone Number -->
            <div class="md:col-span-1">
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input id="phoneNumber" type="tel" formControlName="phoneNumber"
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            
          </div>

          <div class="flex justify-end pt-4 border-t border-gray-200 mt-8">
            <button type="submit" [disabled]="isSaving"
              class="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              <svg *ngIf="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
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
    name: ['', Validators.required],
    phoneNumber: ['']
  });

  userProfile: UserProfile | null = null;
  isLoadingProfile = true;
  isSaving = false;
  submitted = false;

  get f() { return this.profileForm.controls; }

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
            name: this.userProfile.name,
            phoneNumber: this.userProfile.phoneNumber || ''
          });
        }
      },
      error: () => {
        this.isLoadingProfile = false;
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
    this.userService.updateProfile(this.profileForm.value as any).subscribe({
      next: (response) => {
        this.toastService.success('Sukses', 'Profil berhasil diperbarui!');
        if (response.data) {
          this.userProfile = response.data;
        }
      },
      error: () => {
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}
