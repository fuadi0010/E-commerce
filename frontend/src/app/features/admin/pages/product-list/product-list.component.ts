import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product, Category, PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Katalog Produk (Admin)</h2>
          <p class="text-xs text-slate-400 mt-0.5">Kelola data inventaris, stok, harga, dan kategori produk</p>
        </div>
        <a routerLink="/admin/products/new" class="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all gap-2 btn-press">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Tambah Produk Baru</span>
        </a>
      </div>

      <!-- Filters & Search Toolbar (Rule 51 & 52) -->
      <div class="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative flex-grow sm:flex-grow-0 sm:w-72">
          <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="onFilterChange()"
            placeholder="Cari nama produk..."
            class="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
        </div>

        <!-- Category Filter -->
        <select [(ngModel)]="selectedCategory" (change)="onFilterChange()"
          class="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400">
          <option value="">Semua Kategori</option>
          <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
        </select>

        <button (click)="onFilterChange()" class="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all btn-press">
          Terapkan
        </button>
        <button *ngIf="searchKeyword || selectedCategory" (click)="resetFilters()" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
          Reset Filter
        </button>

        <!-- Page Size Selector (Rule 54) -->
        <div class="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>Tampilkan:</span>
          <select [(ngModel)]="pageSize" (change)="onPageSizeChange()"
            class="text-xs border border-slate-200 rounded-xl py-1 px-2.5 bg-white">
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
            <option [ngValue]="50">50</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="p-16 flex flex-col items-center justify-center space-y-3">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs text-slate-400">Memuat katalog produk...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && products.length === 0" class="p-16 text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <h3 class="text-sm font-bold text-slate-900">Tidak Ada Produk Ditemukan</h3>
        <p class="text-xs text-slate-400">Coba sesuaikan kata kunci pencarian atau tambahkan produk baru.</p>
      </div>

      <!-- Products Table -->
      <div *ngIf="!isLoading && products.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" class="px-6 py-3.5">Produk</th>
              <th scope="col" class="px-6 py-3.5">Kategori</th>
              <th scope="col" class="px-6 py-3.5">Harga</th>
              <th scope="col" class="px-6 py-3.5">Stok</th>
              <th scope="col" class="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let product of products" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-11 w-11 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60 flex items-center justify-center">
                    <img *ngIf="product.imageUrl" [src]="product.imageUrl" alt="" class="h-full w-full object-cover">
                    <svg *ngIf="!product.imageUrl" class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 line-clamp-1">{{ product.name }}</div>
                    <div class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{{ product.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                  {{ product.category.name || 'Umum' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900">
                Rp {{ product.price | number:'1.0-0' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs">
                <span [ngClass]="product.stock > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'">
                  {{ product.stock > 0 ? product.stock + ' unit' : 'Habis' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                <a [routerLink]="['/admin/products/edit', product.id]" class="text-indigo-600 hover:text-indigo-900 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                  Edit
                </a>
                <button (click)="deleteProduct(product)" class="text-rose-600 hover:text-rose-900 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Toolbar (Rule 54: nomor klik, total data info, page size) -->
      <div *ngIf="pageData && pageData.totalElements > 0" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Menampilkan <span class="font-bold text-slate-900">{{ (currentPage * pageSize) + 1 }}</span>
          sampai <span class="font-bold text-slate-900">{{ getEndIndex() }}</span>
          dari total <span class="font-bold text-slate-900">{{ pageData.totalElements }}</span> produk
        </div>

        <!-- Page Numbers List -->
        <div class="flex items-center gap-1">
          <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0"
            class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors text-xs">
            &larr; Prev
          </button>
          
          <button *ngFor="let p of getPagesArray()" (click)="changePage(p)"
            [ngClass]="p === currentPage ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'"
            class="w-7 h-7 rounded-xl text-xs transition-colors flex items-center justify-center font-semibold">
            {{ p + 1 }}
          </button>

          <button (click)="changePage(currentPage + 1)" [disabled]="pageData.last"
            class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors text-xs">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  products: Product[] = [];
  categories: Category[] = [];
  pageData: PageResponse<Product> | null = null;
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  searchKeyword = '';
  selectedCategory = '';

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(res => {
      if (res.data) this.categories = res.data;
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts({
      page: this.currentPage,
      size: this.pageSize,
      name: this.searchKeyword.trim() || undefined,
      categoryId: this.selectedCategory || undefined
    }).subscribe({
      next: (response) => {
        if (response.data) {
          this.pageData = response.data;
          this.products = response.data.content;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Error', 'Gagal memuat katalog produk');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadProducts();
  }

  resetFilters() {
    this.searchKeyword = '';
    this.selectedCategory = '';
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadProducts();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && (!this.pageData || newPage < this.pageData.totalPages)) {
      this.currentPage = newPage;
      this.loadProducts();
    }
  }

  getEndIndex(): number {
    if (!this.pageData) return 0;
    return Math.min((this.currentPage + 1) * this.pageSize, this.pageData.totalElements);
  }

  getPagesArray(): number[] {
    if (!this.pageData) return [];
    const total = this.pageData.totalPages;
    return Array.from({ length: total }, (_, i) => i);
  }

  deleteProduct(product: Product) {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.toastService.success('Sukses', `Produk "${product.name}" berhasil dihapus.`);
          this.loadProducts();
        },
        error: () => {
          this.toastService.error('Error', 'Gagal menghapus produk');
        }
      });
    }
  }
}
