import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { VoucherService } from '../../../../core/services/voucher.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { UploadService } from '../../../../core/services/upload.service';
import { OrderRequest } from '../../../../core/models/order.model';
import { Voucher, VoucherCalculationResponse } from '../../../../core/models/voucher.model';

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

          <!-- Dokumen Bukti Pembayaran / Surat Pesanan (PDF / Gambar) -->
          <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-ambient space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Dokumen Bukti / Invoice PO
              </h2>
              <span class="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">Opsional</span>
            </div>

            <p class="text-xs text-slate-500">
              Lampirkan dokumen pendukung transaksi seperti bukti transfer bank, Purchase Order, atau invoice (Format: PDF, PNG, JPG maks 5MB).
            </p>

            <div *ngIf="!uploadedDoc" class="flex flex-col sm:flex-row items-center gap-3">
              <input #pdfInput type="file" (change)="onDocSelected($event)" accept="application/pdf,image/jpeg,image/png,image/webp" class="hidden">
              <button type="button" (click)="pdfInput.click()" [disabled]="isUploadingDoc"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all btn-press disabled:opacity-50">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span>{{ isUploadingDoc ? 'Mengunggah Dokumen...' : 'Pilih Dokumen PDF / Bukti Bayar' }}</span>
              </button>
              <span class="text-[11px] text-slate-400">PDF atau Gambar (Maks 5MB)</span>
            </div>

            <!-- Upload progress -->
            <div *ngIf="isUploadingDoc" class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>Mengunggah dokumen ke server...</span>
                <span class="font-medium text-indigo-600">Validasi PDF Berjalan</span>
              </div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>

            <!-- Document Attached Card -->
            <div *ngIf="uploadedDoc" class="flex items-center justify-between p-3 bg-indigo-50/50 rounded-2xl border border-indigo-200 text-xs">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  PDF
                </div>
                <div class="min-w-0">
                  <span class="font-bold text-slate-900 block truncate">{{ uploadedDoc.name }}</span>
                  <span class="text-[10px] text-slate-500">{{ uploadedDoc.size }} &bull; Terlampir untuk pesanan ini</span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <a [href]="uploadedDoc.url" target="_blank" rel="noopener noreferrer"
                  class="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-[11px] transition-colors">
                  Buka
                </a>
                <button type="button" (click)="removeDoc()" class="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Order Review, Voucher & Total -->
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

            <!-- ========================================== -->
            <!-- VOUCHER PROMO BOX (Entitas Utama ke-6)      -->
            <!-- ========================================== -->
            <div class="pt-4 border-t border-slate-100 space-y-2.5">
              <label class="block text-xs font-bold text-slate-800">Kupon Voucher Diskon:</label>
              
              <!-- Input box & apply button -->
              <div class="flex items-center gap-2">
                <input type="text" [(ngModel)]="voucherInputCode" name="voucherCode"
                  [disabled]="appliedVoucher !== null || isValidatingVoucher"
                  placeholder="Masukkan kode promo..."
                  class="flex-1 p-2.5 text-xs uppercase font-mono font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
                
                <button *ngIf="!appliedVoucher" type="button" (click)="applyVoucher()"
                  [disabled]="!voucherInputCode.trim() || isValidatingVoucher"
                  class="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                  {{ isValidatingVoucher ? 'Memeriksa...' : 'Terapkan' }}
                </button>

                <button *ngIf="appliedVoucher" type="button" (click)="removeVoucher()"
                  class="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all border border-rose-200">
                  Hapus
                </button>
              </div>

              <!-- Quick Clickable Promo Pills -->
              <div *ngIf="!appliedVoucher && activeVouchers.length > 0" class="pt-1">
                <span class="text-[10px] text-slate-400 block mb-1 font-medium">Voucher promo yang tersedia:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button *ngFor="let av of activeVouchers.slice(0, 4)" type="button"
                    (click)="selectVoucherPill(av.code)"
                    class="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition-colors">
                    🏷️ {{ av.code }}
                  </button>
                </div>
              </div>

              <!-- Applied Voucher Badge Banner -->
              <div *ngIf="appliedVoucher" class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <div class="flex items-center gap-1.5">
                  <span>🎉</span>
                  <div>
                    <span class="font-bold">{{ appliedVoucher.code }}</span>
                    <span class="text-[10px] text-emerald-600 block">{{ appliedVoucher.message }}</span>
                  </div>
                </div>
                <span class="font-black text-emerald-700">
                  - Rp {{ appliedVoucher.discountAmount | number:'1.0-0' }}
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

              <div *ngIf="appliedVoucher" class="flex items-center justify-between text-emerald-600 font-bold">
                <span>Potongan Diskon Kupon</span>
                <span>- Rp {{ appliedVoucher.discountAmount | number:'1.0-0' }}</span>
              </div>
              
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Total Pembayaran</span>
                <span class="text-lg font-black text-indigo-600">
                  Rp {{ getFinalAmount() | number:'1.0-0' }}
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
  private voucherService = inject(VoucherService);
  private uploadService = inject(UploadService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isSubmitting = false;

  // Document states (Rule: PDF / Image upload for payment proof / documents)
  isUploadingDoc = false;
  uploadedDoc: { name: string; size: string; url: string; isPdf: boolean } | null = null;

  // Voucher states
  voucherInputCode = '';
  activeVouchers: Voucher[] = [];
  appliedVoucher: VoucherCalculationResponse | null = null;
  isValidatingVoucher = false;

  ngOnInit() {
    if (this.cartService.cartItems().length === 0) {
      this.toastService.warning('Keranjang Kosong', 'Silakan pilih produk terlebih dahulu sebelum checkout.');
      this.router.navigate(['/cart']);
      return;
    }

    this.loadActiveVouchers();
  }

  loadActiveVouchers() {
    this.voucherService.getActiveVouchers().subscribe({
      next: (res) => {
        if (res.data) {
          this.activeVouchers = res.data;
        }
      }
    });
  }

  selectVoucherPill(code: string) {
    this.voucherInputCode = code;
    this.applyVoucher();
  }

  applyVoucher() {
    if (!this.voucherInputCode.trim()) return;

    this.isValidatingVoucher = true;
    const orderAmount = this.cartService.cartTotalPrice();

    this.voucherService.validateVoucher(this.voucherInputCode.trim(), orderAmount).subscribe({
      next: (res) => {
        this.isValidatingVoucher = false;
        if (res.data && res.data.valid) {
          this.appliedVoucher = res.data;
          this.toastService.success('Voucher Berhasil', res.data.message);
        } else {
          this.appliedVoucher = null;
          this.toastService.error('Voucher Gagal', res.data?.message || 'Kode voucher tidak valid');
        }
      },
      error: (err) => {
        this.isValidatingVoucher = false;
        this.appliedVoucher = null;
        this.toastService.error('Voucher Gagal', err.error?.message || 'Gagal memvalidasi voucher');
      }
    });
  }

  removeVoucher() {
    this.appliedVoucher = null;
    this.voucherInputCode = '';
    this.toastService.info('Voucher', 'Penggunaan kupon voucher dibatalkan');
  }

  getFinalAmount(): number {
    if (this.appliedVoucher && this.appliedVoucher.valid) {
      return this.appliedVoucher.finalAmount;
    }
    return this.cartService.cartTotalPrice();
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
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastService.error('Pesanan Gagal', error.error?.message || 'Gagal memproses pesanan.');
      }
    });
  }

  onDocSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Format Tidak Didukung', 'Hanya file PDF dan gambar (JPG, PNG, WebP) yang diizinkan');
      input.value = '';
      return;
    }

    if (file.size > maxBytes) {
      this.toastService.error('Ukuran Melebihi Batas', 'Ukuran file tidak boleh melebihi 5MB');
      input.value = '';
      return;
    }

    this.isUploadingDoc = true;
    this.uploadService.uploadFile(file).subscribe({
      next: (res) => {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        this.uploadedDoc = {
          name: file.name,
          size: sizeFormatted,
          url: res.data || '',
          isPdf: isPdf
        };

        this.isUploadingDoc = false;
        this.toastService.success('Unggah Berhasil', isPdf ? 'Dokumen PDF bukti transaksi berhasil dilampirkan' : 'Bukti pembayaran berhasil dilampirkan');
        input.value = '';
      },
      error: (err) => {
        this.isUploadingDoc = false;
        this.toastService.error('Unggah Gagal', err.error?.message || 'Gagal mengunggah dokumen transaksi');
        input.value = '';
      }
    });
  }

  removeDoc(): void {
    this.uploadedDoc = null;
    this.toastService.info('Dokumen Dihapus', 'Lampiran dokumen transaksi telah dilepas');
  }
}
