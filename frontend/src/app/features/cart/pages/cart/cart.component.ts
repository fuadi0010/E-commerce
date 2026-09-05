import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Page Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Keranjang Belanja</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Kelola barang pilihan Anda sebelum melanjutkan ke pembayaran</p>
        </div>
        <span *ngIf="cartService.cartTotalCount() > 0" 
          class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
          {{ cartService.cartTotalCount() }} Item
        </span>
      </div>

      <!-- Empty Cart State -->
      <div *ngIf="cartService.cartItems().length === 0" 
        class="bg-white p-12 sm:p-16 text-center rounded-3xl border border-slate-200/80 shadow-ambient max-w-lg mx-auto space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">Keranjang Belanja Kosong</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Anda belum menambahkan barang apapun ke keranjang belanja. Jelajahi koleksi kami sekarang!
          </p>
        </div>
        <a routerLink="/catalog" 
          class="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-all btn-press">
          <span>Mulai Belanja</span>
          <span>&rarr;</span>
        </a>
      </div>

      <!-- Cart Content Grid -->
      <div *ngIf="cartService.cartItems().length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Cart Item List -->
        <section class="lg:col-span-8 space-y-4">
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-ambient overflow-hidden">
            <ul role="list" class="divide-y divide-slate-100">
              <li *ngFor="let item of cartService.cartItems()" class="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                
                <!-- Product Thumbnail -->
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100/80 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/50">
                  <img *ngIf="item.product.imageUrl" [src]="item.product.imageUrl" [alt]="item.product.name" 
                    class="w-full h-full object-cover">
                  <div *ngIf="!item.product.imageUrl" class="text-slate-300">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>

                <!-- Product Information -->
                <div class="flex-1 min-w-0 space-y-1">
                  <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {{ item.product.category.name || 'Umum' }}
                  </span>
                  <h3 class="text-sm font-bold text-slate-900 leading-snug">
                    <a [routerLink]="['/product', item.product.id]" class="hover:text-indigo-600 transition-colors">
                      {{ item.product.name }}
                    </a>
                  </h3>
                  <p class="text-xs font-semibold text-slate-500">
                    Harga Satuan: <span class="text-slate-900">Rp {{ item.product.price | number:'1.0-0' }}</span>
                  </p>
                </div>

                <!-- Stepper & Actions -->
                <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  <!-- Stepper Controls -->
                  <div class="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button (click)="decreaseItemQty(item.product.id, item.quantity)"
                      class="w-7 h-7 rounded-lg bg-white shadow-xs text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition-colors btn-press">
                      -
                    </button>
                    <span class="w-9 text-center text-xs font-bold text-slate-900">{{ item.quantity }}</span>
                    <button (click)="increaseItemQty(item.product.id, item.quantity, item.product.stock)" [disabled]="item.quantity >= item.product.stock"
                      class="w-7 h-7 rounded-lg bg-white shadow-xs text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center transition-colors btn-press">
                      +
                    </button>
                  </div>

                  <!-- Subtotal Item -->
                  <div class="text-right min-w-[90px]">
                    <span class="text-xs font-black text-slate-900 block">
                      Rp {{ (item.product.price * item.quantity) | number:'1.0-0' }}
                    </span>
                  </div>

                  <!-- Remove Button -->
                  <button type="button" (click)="removeItem(item.product.id)" 
                    class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors btn-press"
                    title="Hapus dari keranjang">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>

                </div>

              </li>
            </ul>
          </div>
        </section>

        <!-- Order Summary (Sticky) -->
        <section class="lg:col-span-4">
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-ambient p-6 sm:p-7 space-y-6 sticky top-24">
            <h2 class="text-base font-bold text-slate-900">Ringkasan Pesanan</h2>

            <div class="space-y-3 text-xs text-slate-600">
              <div class="flex items-center justify-between">
                <span>Subtotal Barang ({{ cartService.cartTotalCount() }} item)</span>
                <span class="font-bold text-slate-900">Rp {{ cartService.cartTotalPrice() | number:'1.0-0' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Biaya Pengiriman</span>
                <span class="text-emerald-600 font-bold">Gratis Ongkir</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Pajak Transaksi (PPN)</span>
                <span class="text-slate-400">Termasuk</span>
              </div>
              
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Total Tagihan</span>
                <span class="text-base font-black text-indigo-600">
                  Rp {{ cartService.cartTotalPrice() | number:'1.0-0' }}
                </span>
              </div>
            </div>

            <div class="pt-2 space-y-3">
              <a routerLink="/checkout" 
                class="w-full py-3.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-bold text-center block transition-all shadow-sm btn-press">
                Lanjut ke Checkout
              </a>
              <a routerLink="/catalog" 
                class="w-full py-2.5 px-4 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 block transition-colors">
                &larr; Lanjut Pilih Produk Lain
              </a>
            </div>

            <!-- Trust Badge -->
            <div class="pt-4 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-400">
              <svg class="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>Jaminan transaksi aman dan terlindungi enkripsi.</span>
            </div>
          </div>
        </section>

      </div>

    </div>
  `
})
export class CartComponent {
  public cartService = inject(CartService);

  increaseItemQty(productId: string, currentQty: number, stock: number) {
    if (currentQty < stock) {
      this.cartService.updateQuantity(productId, currentQty + 1);
    }
  }

  decreaseItemQty(productId: string, currentQty: number) {
    if (currentQty > 1) {
      this.cartService.updateQuantity(productId, currentQty - 1);
    } else {
      this.cartService.removeFromCart(productId);
    }
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }
}
