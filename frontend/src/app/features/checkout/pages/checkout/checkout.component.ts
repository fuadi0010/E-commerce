import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { OrderRequest } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Checkout Stepper Bar -->
      <div class="max-w-xl mx-auto pb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">&check;</span>
            <span class="text-xs font-semibold text-slate-700">Keranjang</span>
          </div>
          <div class="flex-1 h-0.5 bg-slate-200 mx-4"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">2</span>
            <span class="text-xs font-bold text-slate-900">Pembayaran</span>
          </div>
          <div class="flex-1 h-0.5 bg-slate-200 mx-4"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center">3</span>
            <span class="text-xs font-semibold text-slate-400">Selesai</span>
          </div>
        </div>
      </div>

      <!-- Main Checkout Grid -->
      <form (ngSubmit)="onSubmit($event)" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Delivery & Payment Details -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Shipping Address Summary Box -->
          <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-ambient space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Alamat Pengiriman
              </h2>
              <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Akun Terdaftar</span>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed">
              Pesanan akan dikirimkan sesuai data profil dan kontak Anda. Pastikan nomor telepon Anda selalu aktif untuk koordinasi kurir.
            </p>
          </div>

          <!-- Payment Method Selection -->
          <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-ambient space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Pilihan Metode Pembayaran
              </h2>
            </div>

            <div class="space-y-3">
              <!-- Method 1: Instant QRIS -->
              <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 cursor-pointer">
                <input type="radio" name="paymentMethod" value="QRIS" checked class="mt-0.5 text-indigo-600 focus:ring-indigo-500">
                <div class="text-xs">
                  <span class="font-bold text-slate-900 block">QRIS / Instant Payment (Simulasi Otomatis)</span>
                  <span class="text-slate-500">Verifikasi instan otomatis tanpa biaya admin tambahan.</span>
                </div>
              </label>

              <!-- Method 2: Virtual Account -->
              <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="radio" name="paymentMethod" value="VA" class="mt-0.5 text-indigo-600 focus:ring-indigo-500">
                <div class="text-xs">
                  <span class="font-bold text-slate-900 block">Transfer Virtual Account (BCA / Mandiri / BRI / BNI)</span>
                  <span class="text-slate-500">Nomor rekening unik akan disediakan setelah checkout.</span>
                </div>
              </label>
            </div>

            <div class="pt-2 text-[11px] text-slate-400">
              * Mode simulasi transaksi diaktifkan untuk demo lingkungan development ini.
            </div>
          </div>

        </div>

        <!-- Right: Order Review & Total -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-ambient p-6 sm:p-7 space-y-6 sticky top-24">
            <h2 class="text-base font-bold text-slate-900">Detail Pesanan</h2>

            <!-- Compact Item List -->
            <div class="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              <div *ngFor="let item of cartService.cartItems()" class="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60 flex items-center justify-center">
                    <img *ngIf="item.product.imageUrl" [src]="item.product.imageUrl" [alt]="item.product.name" class="w-full h-full object-cover">
                    <span *ngIf="!item.product.imageUrl" class="text-xs text-slate-400">🛍️</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-bold text-slate-900 truncate max-w-[170px]">{{ item.product.name }}</h4>
                    <p class="text-slate-400">{{ item.quantity }} x Rp {{ item.product.price | number:'1.0-0' }}</p>
                  </div>
                </div>
                <span class="font-bold text-slate-900 flex-shrink-0">
                  Rp {{ (item.product.price * item.quantity) | number:'1.0-0' }}
                </span>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div class="flex items-center justify-between">
                <span>Subtotal Barang</span>
                <span class="font-bold text-slate-900">Rp {{ cartService.cartTotalPrice() | number:'1.0-0' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Ongkos Kirim</span>
                <span class="font-bold text-emerald-600">Gratis (Promo)</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Biaya Layanan</span>
                <span class="text-slate-400">Rp 0</span>
              </div>
              
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Total Pembayaran</span>
                <span class="text-lg font-black text-indigo-600">
                  Rp {{ cartService.cartTotalPrice() | number:'1.0-0' }}
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" [disabled]="isSubmitting || cartService.cartItems().length === 0"
              class="w-full py-4 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-bold text-center block transition-all shadow-sm disabled:opacity-50 btn-press">
              <span *ngIf="!isSubmitting">Konfirmasi & Bayar Sekarang &rarr;</span>
              <span *ngIf="isSubmitting">Memproses Transaksi...</span>
            </button>

            <a routerLink="/cart" class="text-center text-xs font-semibold text-slate-500 hover:text-slate-800 block">
              &larr; Kembali Ubah Keranjang
            </a>
          </div>
        </div>

      </form>

    </div>
  `
})
export class CheckoutComponent implements OnInit {
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isSubmitting = false;

  ngOnInit() {
    if (this.cartService.cartItems().length === 0) {
      this.toastService.warning('Keranjang Kosong', 'Silakan pilih produk terlebih dahulu sebelum checkout.');
      this.router.navigate(['/cart']);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.cartService.cartItems().length === 0) return;

    this.isSubmitting = true;

    const request: OrderRequest = {
      items: this.cartService.cartItems().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.checkout(request).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.toastService.success('Pesanan Berhasil', 'Pesanan Anda telah berhasil dibuat dan tersimpan di sistem.');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastService.error('Pesanan Gagal', error.error?.message || 'Gagal memproses pesanan.');
      }
    });
  }
}
