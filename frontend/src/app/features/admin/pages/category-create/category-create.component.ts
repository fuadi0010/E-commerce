import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 max-w-xl mx-auto overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Tambah Kategori Baru</h2>
          <p class="text-xs text-slate-400 mt-0.5">Buat kategori baru untuk pengelompokan produk toko Anda</p>
        </div>
        <a routerLink="/admin/categories" class="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors">
          <span>&larr;</span> Kembali
        </a>
      </div>

      <div class="p-6 sm:p-8">
        <form (ngSubmit)="onSubmit()" #categoryForm="ngForm" class="space-y-6">
          <div class="space-y-1.5">
            <label for="name" class="block text-xs font-bold text-slate-700">
              Nama Kategori <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="name" name="name" [(ngModel)]="name" required
              class="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              placeholder="cth. Audio & Sound, Smart Watch">
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <a routerLink="/admin/categories" 
              class="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors btn-press">
              Batal
            </a>
            <button type="submit" [disabled]="!categoryForm.form.valid || isLoading"
              class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-sm btn-press">
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CategoryCreateComponent {
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  name: string = '';
  isLoading = false;

  onSubmit() {
    if (!this.name.trim()) {
      return;
    }
    
    this.isLoading = true;
    this.categoryService.createCategory({ name: this.name }).subscribe({
      next: () => {
        this.toastService.success('Success', 'Category created successfully');
        this.router.navigate(['/admin/categories']);
      },
      error: () => {
        this.toastService.error('Error', 'Failed to create category');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
