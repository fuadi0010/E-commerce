import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product, Category, ProductSearchRequest, PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      <!-- High-End Editorial Hero Section -->
      <div class="relative rounded-3xl bg-slate-950 text-white overflow-hidden p-8 sm:p-12 lg:p-14 shadow-ambient-lg border border-slate-800">
        <!-- Subtle background ambient mesh -->
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-300 text-[11px] font-semibold uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Katalog Resmi 2026
          </div>
          
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-none text-white">
            Koleksi Pilihan Terbaik.<br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-400 to-white">
              Kualitas Teruji & Terpercaya.
            </span>
          </h1>

          <p class="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            Temukan aneka produk orisinal dengan garansi resmi dan kemudahan transaksi digital. Nikmati standar belanja terdepan hari ini.
          </p>

          <!-- Integrated Hero Search -->
          <div class="pt-2 max-w-md">
            <div class="relative flex items-center">
              <input type="text" [(ngModel)]="searchParams.name" (keyup.enter)="onSearch()"
                placeholder="Cari nama produk, spesifikasi, atau kategori..."
                class="w-full pl-11 pr-24 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 text-xs sm:text-sm rounded-2xl border border-white/20 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all backdrop-blur-md">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button (click)="onSearch()"
                class="absolute right-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors btn-press">
                Cari
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats Badge Bar -->
        <div class="relative z-10 pt-8 mt-8 border-t border-slate-800/80 flex flex-wrap items-center gap-6 sm:gap-10 text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <span class="text-indigo-400 font-bold text-sm">100%</span>
            <span>Orisinalitas Terjamin</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-indigo-400 font-bold text-sm">24/7</span>
            <span>Dukungan Pelanggan</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-indigo-400 font-bold text-sm">Instant</span>
            <span>Proses Cepat & Aman</span>
          </div>
        </div>
      </div>

      <!-- Quick Category Pills (Horizontal Scroll) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button (click)="selectCategory(undefined)"
          [ngClass]="!searchParams.categoryId ? 'bg-slate-900 text-white shadow-sm font-semibold' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'"
          class="px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all btn-press flex-shrink-0">
          Semua Kategori
        </button>
        <button *ngFor="let cat of categories" (click)="selectCategory(cat.id)"
          [ngClass]="searchParams.categoryId === cat.id ? 'bg-slate-900 text-white shadow-sm font-semibold' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'"
          class="px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all btn-press flex-shrink-0">
          {{ cat.name }}
        </button>
      </div>

      <!-- Main Grid Layout: Filter Sidebar + Products -->
      <div class="flex flex-col lg:flex-row gap-8 items-start">
        
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 flex-shrink-0 space-y-4">
          
          <!-- Urutkan Filter -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">Urutan</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
            </div>
            <select [(ngModel)]="searchParams.sortBy" (change)="onSearch()"
              class="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors">
              <option value="newest">Terbaru Ditambahkan</option>
              <option value="oldest">Terlama Ditambahkan</option>
              <option value="priceAsc">Harga: Terendah &rarr; Tertinggi</option>
              <option value="priceDesc">Harga: Tertinggi &rarr; Terendah</option>
              <option value="nameAsc">Nama Produk: A ke Z</option>
              <option value="nameDesc">Nama Produk: Z ke A</option>
            </select>
          </div>

          <!-- Kategori Sidebar -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">Kategori</span>
              <span class="text-[11px] text-slate-400">{{ categories.length }} total</span>
            </div>
            
            <div class="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button (click)="selectCategory(undefined)"
                [ngClass]="!searchParams.categoryId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between">
                <span>Semua Kategori</span>
                <span *ngIf="!searchParams.categoryId" class="text-indigo-600 font-bold">&check;</span>
              </button>
              <button *ngFor="let cat of categories" (click)="selectCategory(cat.id)"
                [ngClass]="searchParams.categoryId === cat.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between">
                <span class="truncate">{{ cat.name }}</span>
                <span *ngIf="searchParams.categoryId === cat.id" class="text-indigo-600 font-bold">&check;</span>
              </button>
            </div>
          </div>

          <!-- Reset Filter Button -->
          <button (click)="resetFilters()"
            class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors btn-press">
            Reset Semua Filter
          </button>
        </aside>

        <!-- Product Grid Area -->
        <main class="flex-grow w-full">
          
          <!-- Active Filter & Count Toolbar -->
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Menampilkan <span class="font-bold text-slate-900">{{ products.length }}</span> dari 
              <span class="font-bold text-slate-900">{{ pageData?.totalElements || products.length }}</span> produk
              <span *ngIf="searchParams.name" class="ml-2 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                "{{ searchParams.name }}"
              </span>
            </div>
          </div>

          <!-- Skeleton Loading State -->
          <div *ngIf="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white rounded-2xl border border-slate-200/70 p-3 space-y-3">
              <div class="h-48 bg-slate-100 rounded-xl animate-shimmer"></div>
              <div class="h-4 bg-slate-100 rounded-md w-1/3 animate-shimmer"></div>
              <div class="h-5 bg-slate-100 rounded-md w-3/4 animate-shimmer"></div>
              <div class="h-4 bg-slate-100 rounded-md w-1/2 animate-shimmer"></div>
              <div class="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div class="h-6 bg-slate-100 rounded-md w-1/3 animate-shimmer"></div>
                <div class="h-8 bg-slate-100 rounded-lg w-20 animate-shimmer"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && products.length === 0" 
            class="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">Produk Tidak Ditemukan</h3>
              <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tidak ada produk yang sesuai dengan kriteria pencarian Anda. Silakan coba kata kunci lain atau reset filter.
              </p>
            </div>
            <button (click)="resetFilters()" 
              class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all btn-press">
              Hapus Semua Filter
            </button>
          </div>

          <!-- Products Grid -->
          <div *ngIf="!isLoading && products.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <!-- Card Component -->
              <div *ngFor="let product of products" 
                class="group bg-white rounded-2xl border border-slate-200/70 p-3 hover:border-slate-300 hover:shadow-ambient-lg transition-all duration-300 flex flex-col justify-between">
                
                <div>
                  <!-- Image Wrapper -->
                  <div class="h-52 bg-slate-100/70 rounded-xl overflow-hidden relative flex items-center justify-center">
                    <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    
                    <div *ngIf="!product.imageUrl" class="text-slate-300 flex flex-col items-center gap-1">
                      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span class="text-[10px] font-semibold text-slate-400">AURA Goods</span>
                    </div>

                    <!-- Stock Badge Tags -->
                    <span *ngIf="product.stock === 0" 
                      class="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      Stok Habis
                    </span>
                    <span *ngIf="product.stock > 0 && product.stock <= 5" 
                      class="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      Sisa {{ product.stock }}
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="pt-3 px-1 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {{ product.category.name || 'Umum' }}
                      </span>
                    </div>

                    <h3 class="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      <a [routerLink]="['/product', product.slug]" class="focus:outline-none">
                        {{ product.name }}
                      </a>
                    </h3>

                    <p class="text-slate-500 text-xs line-clamp-2 leading-relaxed">{{ product.description }}</p>
                  </div>
                </div>

                <!-- Price & Action Footer -->
                <div class="pt-3 px-1 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 block font-medium">Harga</span>
                    <span class="text-base font-extrabold text-slate-900 tracking-tight">
                      Rp {{ product.price | number:'1.0-0' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <a [routerLink]="['/product', product.slug]"
                      class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Lihat Detail">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </a>

                    <button (click)="addToCart(product)" [disabled]="product.stock === 0"
                      class="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 btn-press">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      <span>Beli</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            <!-- Pagination Toolbar -->
            <div *ngIf="pageData && pageData.totalPages > 1" 
              class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 text-xs text-slate-500">
              <div>
                Halaman <span class="font-bold text-slate-900">{{ (searchParams.page || 0) + 1 }}</span> dari 
                <span class="font-bold text-slate-900">{{ pageData.totalPages }}</span>
              </div>

              <div class="flex items-center gap-1.5">
                <button (click)="changePage((searchParams.page || 0) - 1)" [disabled]="(searchParams.page || 0) === 0"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors btn-press">
                  &larr; Prev
                </button>
                
                <button *ngFor="let p of getPagesArray()" (click)="changePage(p)"
                  [ngClass]="p === (searchParams.page || 0) ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'"
                  class="w-8 h-8 rounded-xl text-xs transition-colors flex items-center justify-center btn-press">
                  {{ p + 1 }}
                </button>

                <button (click)="changePage((searchParams.page || 0) + 1)" [disabled]="pageData.last"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors btn-press">
                  Next &rarr;
                </button>
              </div>
            </div>

          </div>

        </main>

      </div>

    </div>
  `
})
export class ProductCatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  products: Product[] = [];
  categories: Category[] = [];
  pageData: PageResponse<Product> | null = null;
  isLoading = false;

  searchParams: ProductSearchRequest = {
    page: 0,
    size: 9,
    sortBy: 'newest'
  };

  ngOnInit() {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchParams.name = params['search'];
      }
      this.loadProducts();
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(res => {
      if (res.data) this.categories = res.data;
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.searchProducts(this.searchParams).subscribe({
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

  onSearch() {
    this.searchParams.page = 0;
    this.loadProducts();
  }

  selectCategory(categoryId?: string) {
    this.searchParams.categoryId = categoryId;
    this.searchParams.page = 0;
    this.loadProducts();
  }

  resetFilters() {
    this.searchParams = {
      page: 0,
      size: 9,
      sortBy: 'newest',
      name: undefined,
      categoryId: undefined
    };
    this.loadProducts();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && (!this.pageData || newPage < this.pageData.totalPages)) {
      this.searchParams.page = newPage;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPagesArray(): number[] {
    if (!this.pageData) return [];
    const total = this.pageData.totalPages;
    return Array.from({ length: total }, (_, i) => i);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product, 1);
    this.toastService.success('Berhasil', `${product.name} telah dimasukkan ke keranjang belanja.`);
  }
}
