import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <!-- Breadcrumb Navigation -->
      <nav class="flex items-center gap-2 text-xs text-slate-500">
        <a routerLink="/catalog" class="hover:text-slate-900 transition-colors">Katalog</a>
        <span>&rsaquo;</span>
        <span *ngIf="product" class="hover:text-slate-900 transition-colors">{{ product.category.name || 'Umum' }}</span>
        <span *ngIf="product">&rsaquo;</span>
        <span *ngIf="product" class="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">{{ product.name }}</span>
      </nav>

      <!-- Loading Skeleton -->
      <div *ngIf="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm">
        <div class="h-[400px] bg-slate-100 rounded-2xl animate-shimmer"></div>
        <div class="space-y-4 pt-4">
          <div class="h-6 bg-slate-100 rounded-md w-1/4 animate-shimmer"></div>
          <div class="h-10 bg-slate-100 rounded-md w-3/4 animate-shimmer"></div>
          <div class="h-8 bg-slate-100 rounded-md w-1/3 animate-shimmer"></div>
          <div class="h-24 bg-slate-100 rounded-md w-full animate-shimmer"></div>
          <div class="h-12 bg-slate-100 rounded-xl w-full animate-shimmer"></div>
        </div>
      </div>

      <!-- Error / Not Found State -->
      <div *ngIf="!isLoading && !product" 
        class="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-lg mx-auto p-8 space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">Produk Tidak Ditemukan</h2>
          <p class="text-xs text-slate-500 mt-1">Produk yang Anda cari tidak tersedia atau tautan yang Anda tuju telah kedaluwarsa.</p>
        </div>
        <a routerLink="/catalog" 
          class="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors btn-press">
          Lihat Katalog Produk
        </a>
      </div>

      <!-- Main Product View -->
      <div *ngIf="!isLoading && product" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- Left: Image Gallery Showcase -->
        <div class="lg:col-span-6 space-y-4">
          <div class="p-3 bg-white border border-slate-200/80 rounded-3xl shadow-ambient">
            <div class="h-[380px] sm:h-[480px] bg-slate-100/70 rounded-2xl overflow-hidden relative flex items-center justify-center">
              <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" 
                class="w-full h-full object-contain p-6 hover:scale-105 transition-transform duration-500">
              
              <div *ngIf="!product.imageUrl" class="text-slate-300 flex flex-col items-center gap-2">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-xs font-bold text-slate-400">AURA Original Product</span>
              </div>

              <!-- Stock Tag Badge -->
              <span *ngIf="product.stock === 0" 
                class="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-full font-bold text-xs shadow-md uppercase tracking-wider">
                Stok Habis
              </span>
              <span *ngIf="product.stock > 0 && product.stock <= 5" 
                class="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-md uppercase tracking-wider">
                Sisa {{ product.stock }} Unit
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Information & Purchase Flow -->
        <div class="lg:col-span-6 space-y-6">
          
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-ambient space-y-6">
            
            <!-- Category & Availability Pill -->
            <div class="flex items-center gap-2.5">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                {{ product.category.name || 'Umum' }}
              </span>
              <span *ngIf="product.stock > 0" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Tersedia ({{ product.stock }} unit)
              </span>
            </div>

            <!-- Title & Price -->
            <div class="space-y-2">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {{ product.name }}
              </h1>
              
              <div class="pt-2">
                <span class="text-xs text-slate-400 block font-medium">Harga Resmi</span>
                <p class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Rp {{ product.price | number:'1.0-0' }}
                </p>
              </div>
            </div>

            <!-- Description -->
            <div class="pt-4 border-t border-slate-100 space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Deskripsi Produk</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {{ product.description }}
              </p>
            </div>

            <!-- Quantity Stepper & Add to Cart -->
            <div class="pt-6 border-t border-slate-100 space-y-4">
              
              <!-- Stepper -->
              <div *ngIf="product.stock > 0" class="flex items-center gap-4">
                <span class="text-xs font-semibold text-slate-700">Jumlah Beli:</span>
                <div class="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button (click)="decrementQuantity()" [disabled]="selectedQuantity <= 1"
                    class="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors btn-press">
                    -
                  </button>
                  <span class="w-12 text-center text-xs font-bold text-slate-900">{{ selectedQuantity }}</span>
                  <button (click)="incrementQuantity()" [disabled]="selectedQuantity >= product.stock"
                    class="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors btn-press">
                    +
                  </button>
                </div>
              </div>

              <!-- CTA Button -->
              <button [disabled]="product.stock === 0" (click)="addToCart()"
                class="w-full py-4 px-6 rounded-2xl shadow-ambient text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 btn-press">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <span>Tambah ke Keranjang Belanja</span>
              </button>

              <p *ngIf="product.stock === 0" class="text-center text-xs font-semibold text-rose-600">
                Maaf, persediaan stok produk ini saat ini sedang habis.
              </p>
            </div>

            <!-- Guarantee Features -->
            <div class="pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-base block mb-1">🛡️</span>
                <span class="text-[10px] font-bold text-slate-800 block">Garansi Resmi</span>
                <span class="text-[9px] text-slate-400">100% Orisinal</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-base block mb-1">📦</span>
                <span class="text-[10px] font-bold text-slate-800 block">Kemasan Aman</span>
                <span class="text-[9px] text-slate-400">Extra Bubble</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-base block mb-1">⚡</span>
                <span class="text-[10px] font-bold text-slate-800 block">Kirim Cepat</span>
                <span class="text-[9px] text-slate-400">Hari yang Sama</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private cartService = inject(CartService);

  product: Product | null = null;
  isLoading = true;
  selectedQuantity = 1;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || params.get('slug');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response.data) {
          this.product = response.data;
          this.selectedQuantity = 1;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Error', 'Gagal memuat detail produk');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  incrementQuantity() {
    if (this.product && this.selectedQuantity < this.product.stock) {
      this.selectedQuantity++;
    }
  }

  decrementQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart() {
    if (this.product && this.product.stock > 0) {
      this.cartService.addToCart(this.product, this.selectedQuantity);
      this.toastService.success('Berhasil', `${this.selectedQuantity}x ${this.product.name} dimasukkan ke keranjang.`);
    }
  }
}
