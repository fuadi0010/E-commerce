import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { UploadService } from '../../../../core/services/upload.service';
import { Category } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 max-w-3xl mx-auto overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">{{ isEditMode ? 'Edit Produk' : 'Tambah Produk Baru' }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">Lengkapi formulir di bawah ini dengan informasi produk yang valid.</p>
        </div>
        <a routerLink="/admin/products" class="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors">
          <span>&larr;</span> Kembali ke Daftar
        </a>
      </div>

      <div class="p-6 sm:p-8">
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-6">
            
            <!-- Nama Produk -->
            <div class="sm:col-span-6 space-y-1.5">
              <label for="name" class="block text-xs font-bold text-slate-700">
                Nama Produk <span class="text-rose-500">*</span>
              </label>
              <input type="text" id="name" formControlName="name"
                class="block w-full text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="getFieldClass('name')"
                placeholder="cth. Headset Wireless ANC 40dB">
              <div *ngIf="isFieldInvalid('name')" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Nama produk wajib diisi (minimal 3 karakter).
              </div>
            </div>

            <!-- Deskripsi -->
            <div class="sm:col-span-6 space-y-1.5">
              <label for="description" class="block text-xs font-bold text-slate-700">
                Deskripsi Lengkap <span class="text-rose-500">*</span>
              </label>
              <textarea id="description" formControlName="description" rows="3"
                class="block w-full text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="getFieldClass('description')"
                placeholder="Jelaskan spesifikasi, fitur, dan keunggulan produk..."></textarea>
              <div *ngIf="isFieldInvalid('description')" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Deskripsi produk wajib diisi.
              </div>
            </div>

            <!-- Harga -->
            <div class="sm:col-span-3 space-y-1.5">
              <label for="price" class="block text-xs font-bold text-slate-700">
                Harga (IDR) <span class="text-rose-500">*</span>
              </label>
              <div class="relative rounded-xl">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span class="text-slate-400 text-xs font-bold">Rp</span>
                </div>
                <input type="number" id="price" formControlName="price" min="1" step="1000"
                  class="block w-full pl-10 text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  [ngClass]="getFieldClass('price')"
                  placeholder="150000">
              </div>
              <div *ngIf="isFieldInvalid('price')" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Harga harus lebih besar dari 0.
              </div>
            </div>

            <!-- Stok -->
            <div class="sm:col-span-3 space-y-1.5">
              <label for="stock" class="block text-xs font-bold text-slate-700">
                Jumlah Stok <span class="text-rose-500">*</span>
              </label>
              <input type="number" id="stock" formControlName="stock" min="0"
                class="block w-full text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="getFieldClass('stock')"
                placeholder="10">
              <div *ngIf="isFieldInvalid('stock')" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Stok tidak boleh bernilai negatif.
              </div>
            </div>

            <!-- Kategori -->
            <div class="sm:col-span-3 space-y-1.5">
              <label for="categoryId" class="block text-xs font-bold text-slate-700">
                Kategori Produk <span class="text-rose-500">*</span>
              </label>
              <select id="categoryId" formControlName="categoryId"
                class="block w-full text-xs border rounded-xl py-2.5 px-3.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                [ngClass]="getFieldClass('categoryId')">
                <option value="" disabled>-- Pilih Kategori --</option>
                <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
              </select>
              <div *ngIf="isFieldInvalid('categoryId')" class="text-rose-600 text-[11px] font-medium pt-0.5">
                Silakan pilih salah satu kategori.
              </div>
            </div>

            <!-- File Upload & Image Preview (Rule 41 & 42) -->
            <div class="sm:col-span-6 border-t border-slate-100 pt-5 space-y-3">
              <label class="block text-xs font-bold text-slate-700">
                Foto / Gambar Produk
              </label>
              
              <div class="flex flex-col sm:flex-row items-start gap-4">
                <!-- Image Preview Box -->
                <div class="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                  <img *ngIf="productForm.get('imageUrl')?.value" [src]="productForm.get('imageUrl')?.value" alt="Preview" class="w-full h-full object-cover">
                  <div *ngIf="!productForm.get('imageUrl')?.value" class="text-center p-3 text-slate-400 flex flex-col items-center">
                    <svg class="w-6 h-6 mb-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-[10px]">Belum ada foto</span>
                  </div>
                  <button *ngIf="productForm.get('imageUrl')?.value" type="button" (click)="removeImage()"
                    class="absolute inset-0 bg-slate-900/70 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    Hapus Foto
                  </button>
                </div>

                <!-- Upload Input & Progress -->
                <div class="flex-grow w-full space-y-2">
                  <div class="flex items-center gap-2">
                    <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden" id="fileUpload">
                    <button type="button" (click)="fileInput.click()" [disabled]="isUploading"
                      class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-2 disabled:opacity-50 btn-press">
                      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                      </svg>
                      <span>{{ isUploading ? 'Mengunggah...' : 'Pilih File Gambar' }}</span>
                    </button>
                    <span class="text-xs text-slate-400">Maks. 5MB (JPG, PNG, WEBP)</span>
                  </div>

                  <!-- Optional Direct URL Input -->
                  <div class="mt-2">
                    <input type="text" formControlName="imageUrl"
                      class="block w-full text-xs border border-slate-200 rounded-xl py-2 px-3 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="Atau masukkan tautan URL gambar langsung...">
                  </div>

                  <div *ngIf="isUploading" class="flex items-center gap-2 mt-2">
                    <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                    <span class="text-[10px] text-slate-400">Mengunggah...</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Form Actions -->
          <div class="pt-5 border-t border-slate-100 flex items-center justify-end space-x-3">
            <a routerLink="/admin/products" class="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors btn-press">
              Batal
            </a>
            <button type="submit" [disabled]="productForm.invalid || isLoading || isUploading"
              class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-sm btn-press">
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditMode ? 'Simpan Perubahan' : 'Terbitkan Produk' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private uploadService = inject(UploadService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  isUploading = false;
  isEditMode = false;
  productId: string | null = null;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = id;
        this.loadProduct(id);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(response => {
      if (response.data) {
        this.categories = response.data;
      }
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.data) {
          const product = response.data;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.category?.id || '',
            imageUrl: product.imageUrl || ''
          });
        }
      },
      error: () => {
        this.toastService.error('Error', 'Gagal memuat detail produk');
        this.router.navigate(['/admin/products']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Realtime validation helper (Rule 55)
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldClass(fieldName: string): string {
    return this.isFieldInvalid(fieldName)
      ? 'border-red-400 text-red-900 bg-red-50/20'
      : 'border-gray-200 text-gray-900';
  }

  // File Upload Handler (Rule 41 & 42)
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validasi ukuran: max 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('File Terlalu Besar', 'Ukuran gambar maksimal adalah 5MB.');
        return;
      }

      this.isUploading = true;
      this.uploadService.uploadFile(file).subscribe({
        next: (res) => {
          if (res.data) {
            this.productForm.patchValue({ imageUrl: res.data });
            this.toastService.success('Berhasil', 'Gambar produk berhasil diunggah.');
          }
        },
        error: (err) => {
          this.toastService.error('Gagal Unggah', err.error?.message || 'Terjadi kesalahan saat mengunggah file.');
          this.isUploading = false;
        },
        complete: () => {
          this.isUploading = false;
        }
      });
    }
  }

  removeImage() {
    this.productForm.patchValue({ imageUrl: '' });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const request = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, request).subscribe({
        next: () => {
          this.toastService.success('Sukses', 'Produk berhasil diperbarui.');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.toastService.error('Error', err.error?.message || 'Gagal memperbarui produk.');
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false)
      });
    } else {
      this.productService.createProduct(request).subscribe({
        next: () => {
          this.toastService.success('Sukses', 'Produk baru berhasil dibuat.');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.toastService.error('Error', err.error?.message || 'Gagal membuat produk.');
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false)
      });
    }
  }
}
