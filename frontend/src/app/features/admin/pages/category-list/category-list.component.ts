import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Manajemen Kategori</h2>
          <p class="text-xs text-slate-400 mt-0.5">Kelola kategori produk untuk pengelompokan katalog toko</p>
        </div>
        <a routerLink="/admin/categories/new" class="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all gap-2 btn-press">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Tambah Kategori</span>
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="p-16 flex flex-col items-center justify-center space-y-3">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs text-slate-400">Memuat daftar kategori...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && categories.length === 0" class="p-16 text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
        </div>
        <h3 class="text-sm font-bold text-slate-900">Belum Ada Kategori</h3>
        <p class="text-xs text-slate-400">Mulai tambahkan kategori baru untuk mengelompokkan produk Anda.</p>
      </div>

      <!-- Categories Table -->
      <div *ngIf="!isLoading && categories.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" class="px-6 py-3.5 w-16">No</th>
              <th scope="col" class="px-6 py-3.5">Nama Kategori</th>
              <th scope="col" class="px-6 py-3.5">ID Kategori</th>
              <th scope="col" class="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let category of categories; let i = index" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-6 py-4 text-slate-400 font-mono">{{ i + 1 }}</td>
              
              <!-- Nama Kategori: Normal / Edit Mode -->
              <td class="px-6 py-4 font-bold text-slate-900">
                <ng-container *ngIf="editingId !== category.id">
                  {{ category.name }}
                </ng-container>
                <div *ngIf="editingId === category.id" class="flex items-center gap-2">
                  <input type="text" [(ngModel)]="editingName"
                    class="text-xs border border-indigo-400 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-100 w-48"
                    placeholder="Nama kategori baru">
                  <button (click)="saveEdit(category.id)" [disabled]="isSaving"
                    class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 btn-press">
                    Simpan
                  </button>
                  <button (click)="cancelEdit()"
                    class="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                    Batal
                  </button>
                </div>
              </td>

              <td class="px-6 py-4 font-mono text-slate-400">
                {{ category.id }}
              </td>

              <!-- Action Buttons -->
              <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                <button *ngIf="editingId !== category.id" (click)="startEdit(category)"
                  class="text-indigo-600 hover:text-indigo-900 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                  Edit
                </button>
                <button (click)="deleteCategory(category)"
                  class="text-rose-600 hover:text-rose-900 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex justify-between items-center">
        <span>Total {{ categories.length }} kategori terdaftar</span>
        <span class="text-indigo-600 font-semibold">Tersinkronisasi</span>
      </div>
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  categories: Category[] = [];
  isLoading = false;
  isSaving = false;
  editingId: string | null = null;
  editingName = '';

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        if (response.data) {
          this.categories = response.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Error', 'Gagal memuat daftar kategori');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  startEdit(category: Category) {
    this.editingId = category.id;
    this.editingName = category.name;
  }

  cancelEdit() {
    this.editingId = null;
    this.editingName = '';
  }

  saveEdit(id: string) {
    if (!this.editingName.trim()) {
      this.toastService.warning('Peringatan', 'Nama kategori tidak boleh kosong');
      return;
    }

    this.isSaving = true;
    this.categoryService.updateCategory(id, { name: this.editingName.trim() }).subscribe({
      next: () => {
        this.toastService.success('Sukses', 'Kategori berhasil diperbarui');
        this.cancelEdit();
        this.loadCategories();
      },
      error: (err) => {
        this.toastService.error('Error', err.error?.message || 'Gagal memperbarui kategori');
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  deleteCategory(category: Category) {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.toastService.success('Sukses', `Kategori "${category.name}" berhasil dihapus.`);
          this.loadCategories();
        },
        error: (err) => {
          this.toastService.error('Error', err.error?.message || 'Gagal menghapus kategori.');
        }
      });
    }
  }
}
