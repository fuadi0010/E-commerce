import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { OrderResponse } from '../../../../core/models/order.model';
import { PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { UploadService } from '../../../../core/services/upload.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav class="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <a routerLink="/dashboard" class="hover:text-slate-600 transition-colors">Dashboard</a>
            <span>/</span>
            <span class="text-slate-700 font-semibold">Riwayat Pesanan</span>
          </nav>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">Riwayat Pesanan Saya</h1>
          <p class="text-xs text-slate-500 mt-1">Pantau status transaksi, rincian produk, dan pengiriman barang belanja Anda</p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <a routerLink="/catalog"
            class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all btn-press">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>Katalog Produk</span>
          </a>
          <button (click)="loadOrders()"
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all btn-press"
            title="Segarkan data">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="hidden sm:inline">Segarkan</span>
          </button>
        </div>
      </div>

      <!-- Main Container Card -->
      <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 overflow-hidden">
        <!-- Status Filter Tabs -->
        <div class="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          <button *ngFor="let s of statusOptions"
            (click)="selectStatus(s.value)"
            [ngClass]="selectedStatus === s.value ? 'bg-slate-900 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
            class="px-3.5 py-1.5 text-xs rounded-xl transition-all whitespace-nowrap">
            {{ s.label }}
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="p-16 flex flex-col items-center justify-center space-y-3">
          <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs text-slate-400">Memuat riwayat pesanan Anda...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && orders.length === 0" class="p-16 text-center space-y-4">
          <div class="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">
              {{ selectedStatus === 'ALL' ? 'Belum Ada Pesanan' : 'Tidak Ada Pesanan Ditemukan' }}
            </h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
              {{ selectedStatus === 'ALL' 
                  ? 'Anda belum pernah melakukan pemesanan. Temukan produk impian Anda sekarang!' 
                  : 'Tidak ditemukan pesanan dengan status ' + selectedStatus + '.' }}
            </p>
          </div>
          <div class="pt-2">
            <a *ngIf="selectedStatus === 'ALL'" routerLink="/catalog"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all btn-press">
              <span>Mulai Belanja Sekarang</span>
              <span>&rarr;</span>
            </a>
            <button *ngIf="selectedStatus !== 'ALL'" (click)="selectStatus('ALL')"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
              <span>Lihat Semua Pesanan</span>
            </button>
          </div>
        </div>

        <!-- Order Cards List -->
        <div *ngIf="!isLoading && orders.length > 0" class="divide-y divide-slate-100 p-4 sm:p-6 space-y-4">
          <div *ngFor="let order of orders" 
            class="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all overflow-hidden">
            
            <!-- Card Header -->
            <div class="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-slate-900">#{{ order.id.substring(0, 8) }}...</span>
                <span class="text-slate-300">&bull;</span>
                <span class="text-slate-500">{{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span *ngIf="order.paymentMethod" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {{ order.paymentMethod }}
                </span>
                <span [class]="getStatusBadgeClass(order.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border">
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" [class]="getStatusDotClass(order.status)"></span>
                  {{ order.status }}
                </span>
              </div>
            </div>

            <!-- Card Body: Products Preview -->
            <div class="p-5 space-y-3">
              <div *ngFor="let item of order.items" class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                    <img *ngIf="item.product.imageUrl" [src]="item.product.imageUrl" [alt]="item.product.name" class="w-full h-full object-cover">
                    <svg *ngIf="!item.product.imageUrl" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <a [routerLink]="['/product', item.product.id]" class="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                      {{ item.product.name }}
                    </a>
                    <div class="text-[11px] text-slate-500 mt-0.5">
                      {{ item.quantity }} barang &times; Rp {{ item.priceAtTime | number:'1.0-0' }}
                    </div>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-xs font-bold text-slate-900">
                    Rp {{ item.subTotal | number:'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Footer: Total & Actions -->
            <div class="px-5 py-3.5 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-500">Total Pembayaran:</span>
                <span class="text-sm font-extrabold text-indigo-600">Rp {{ order.totalAmount | number:'1.0-0' }}</span>
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <!-- Tombol Bayar Sekarang — hanya untuk pesanan PENDING -->
                <button *ngIf="order.status === 'PENDING'"
                  (click)="payNow(order)"
                  [disabled]="payingOrderId === order.id"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all btn-press shadow-sm">
                  <svg *ngIf="payingOrderId !== order.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <svg *ngIf="payingOrderId === order.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ payingOrderId === order.id ? 'Memproses...' : 'Bayar Sekarang' }}</span>
                </button>
                <button *ngIf="order.status === 'PENDING'"
                  (click)="openChangePaymentModal(order, $event)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all btn-press shadow-xs"
                  title="Ganti metode pembayaran">
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                  <span>Ubah Metode</span>
                </button>
                <button *ngIf="order.status === 'PENDING'"
                  (click)="openCancelModal(order, $event)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-xl text-xs font-semibold transition-all btn-press shadow-xs"
                  title="Batalkan pesanan sebelum dibayar">
                  <svg class="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Batalkan</span>
                </button>
                <button (click)="openDetailModal(order)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all btn-press shadow-xs">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span>Detail Rincian</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Toolbar -->
        <div *ngIf="pageData && pageData.totalElements > 0" 
          class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Menampilkan <span class="font-bold text-slate-900">{{ (currentPage * pageSize) + 1 }}</span>
            sampai <span class="font-bold text-slate-900">{{ getEndIndex() }}</span>
            dari total <span class="font-bold text-slate-900">{{ pageData.totalElements }}</span> pesanan
          </div>

          <div class="flex items-center gap-1">
            <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0"
              class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors text-xs font-semibold">
              &larr; Prev
            </button>
            
            <button *ngFor="let p of getPagesArray()" (click)="changePage(p)"
              [ngClass]="p === currentPage ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'"
              class="w-7 h-7 rounded-xl text-xs transition-colors flex items-center justify-center font-semibold">
              {{ p + 1 }}
            </button>

            <button (click)="changePage(currentPage + 1)" [disabled]="pageData.last"
              class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors text-xs font-semibold">
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div *ngIf="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-900">Rincian Lengkap Pesanan</h3>
              <span [class]="getStatusBadgeClass(selectedOrder.status)" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border">
                {{ selectedOrder.status }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono mt-0.5">ID: {{ selectedOrder.id }}</p>
          </div>
          <button (click)="closeDetailModal()" class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Scrollable Content -->
        <div class="py-5 space-y-6 overflow-y-auto pr-1">
          <!-- Fulfillment Progress Bar -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Status Pengiriman</div>
            <div class="grid grid-cols-4 gap-2 text-center text-xs">
              <!-- Step 1 -->
              <div class="space-y-1.5">
                <div class="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs"
                  [ngClass]="getStepClass(1, selectedOrder.status)">
                  1
                </div>
                <span class="block text-[11px] font-semibold text-slate-700">Dibuat</span>
              </div>
              <!-- Step 2 -->
              <div class="space-y-1.5">
                <div class="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs"
                  [ngClass]="getStepClass(2, selectedOrder.status)">
                  2
                </div>
                <span class="block text-[11px] font-semibold text-slate-700">Dibayar</span>
              </div>
              <!-- Step 3 -->
              <div class="space-y-1.5">
                <div class="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs"
                  [ngClass]="getStepClass(3, selectedOrder.status)">
                  3
                </div>
                <span class="block text-[11px] font-semibold text-slate-700">Dikirim</span>
              </div>
              <!-- Step 4 -->
              <div class="space-y-1.5">
                <div class="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs"
                  [ngClass]="getStepClass(4, selectedOrder.status)">
                  4
                </div>
                <span class="block text-[11px] font-semibold text-slate-700">Selesai</span>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div>
            <div class="text-xs font-bold text-slate-800 mb-2.5">Produk yang Dibeli:</div>
            <div class="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
              <div *ngFor="let item of selectedOrder.items" class="p-3.5 flex items-center justify-between gap-3 text-xs bg-white">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                    <img *ngIf="item.product.imageUrl" [src]="item.product.imageUrl" [alt]="item.product.name" class="w-full h-full object-cover">
                    <svg *ngIf="!item.product.imageUrl" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <a [routerLink]="['/product', item.product.id]" (click)="closeDetailModal()" class="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                      {{ item.product.name }}
                    </a>
                    <div class="text-[11px] text-slate-400 mt-0.5">
                      {{ item.quantity }} &times; Rp {{ item.priceAtTime | number:'1.0-0' }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <span class="font-bold text-slate-900">
                    Rp {{ item.subTotal | number:'1.0-0' }}
                  </span>
                  <a *ngIf="selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DELIVERED'"
                    [routerLink]="['/product', item.product.id]"
                    (click)="closeDetailModal()"
                    class="px-2 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    Beri Ulasan
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Dokumen Bukti Pembayaran (PDF / Gambar) Upload Section -->
          <div class="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span class="text-xs font-bold text-slate-900">Dokumen Bukti Pembayaran / Transfer</span>
              </div>
              <span class="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                PDF, JPG, PNG &bull; Maks 5MB
              </span>
            </div>

            <!-- Upload Zone / Button -->
            <div *ngIf="!uploadedDocs[selectedOrder.id]" class="flex flex-col sm:flex-row items-center gap-3">
              <input #docFileInput type="file" (change)="onDocumentSelected($event, selectedOrder.id)"
                accept="application/pdf,image/jpeg,image/png,image/webp" class="hidden">
              <button type="button" (click)="docFileInput.click()" [disabled]="isUploadingDoc"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-all btn-press disabled:opacity-50">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span>{{ isUploadingDoc ? 'Mengunggah Dokumen...' : 'Unggah Bukti Bayar / Dokumen PDF' }}</span>
              </button>
              <span class="text-[11px] text-slate-500 text-center sm:text-left">
                Lampirkan resi transfer bank, invoice, atau dokumen transaksi (PDF/Gambar).
              </span>
            </div>

            <!-- Uploading Progress Bar -->
            <div *ngIf="isUploadingDoc" class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>Mengunggah dokumen ke sistem...</span>
                <span class="font-medium text-indigo-600">Validasi PDF Berjalan</span>
              </div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>

            <!-- Uploaded Document Preview Card -->
            <div *ngIf="uploadedDocs[selectedOrder.id]" 
              class="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200/80 shadow-xs text-xs">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  PDF
                </div>
                <div class="min-w-0">
                  <span class="font-bold text-slate-900 block truncate">{{ uploadedDocs[selectedOrder.id].fileName }}</span>
                  <span class="text-[10px] text-slate-400">{{ uploadedDocs[selectedOrder.id].fileSize }} &bull; Dokumen Terlampir</span>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <a [href]="uploadedDocs[selectedOrder.id].url" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors text-[11px]">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  <span>Lihat PDF</span>
                </a>
                <button (click)="removeDocument(selectedOrder.id)"
                  class="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Hapus Dokumen">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- QRIS Information & Instruction Box (ORDER-PAYMENT-FIX-001) -->
          <div *ngIf="selectedOrder.status === 'PENDING' && (selectedOrder.paymentMethod === 'QRIS' || !selectedOrder.paymentMethod)" 
            class="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs space-y-2">
            <div class="flex items-center gap-2 text-indigo-950 font-bold">
              <span class="text-base">📱</span>
              <span>Metode Pembayaran QRIS (Midtrans Snap)</span>
            </div>
            <p class="text-xs text-indigo-700 leading-relaxed">
              Klik <strong>"Bayar Sekarang"</strong> untuk memunculkan QR Code di jendela pop-up Midtrans Snap.
            </p>
            <div class="text-[11px] text-slate-600 bg-white/90 p-2.5 rounded-xl border border-indigo-100 flex items-start gap-2">
              <span class="text-indigo-600 font-bold shrink-0">💡 Unduh / Simpan QR:</span>
              <span>Pada jendela pembayaran Midtrans Snap, klik kanan pada gambar QR Code lalu pilih <strong>"Simpan gambar sebagai..."</strong> atau <strong>"Copy image address"</strong> untuk menyimpan QR code ke perangkat Anda.</span>
            </div>
          </div>

          <!-- Price Summary Breakdown -->
          <div class="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-600">
              <span>Waktu Pemesanan:</span>
              <span class="font-medium text-slate-800">{{ selectedOrder.createdAt | date:'dd MMMM yyyy, HH:mm:ss' }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>Total Item Produk:</span>
              <span class="font-medium text-slate-800">{{ selectedOrder.items.length }} jenis barang</span>
            </div>
            <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span class="font-bold text-slate-900">Total Pembayaran:</span>
              <span class="text-base font-extrabold text-indigo-600">Rp {{ selectedOrder.totalAmount | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2" *ngIf="selectedOrder.status === 'PENDING'">
            <button type="button" (click)="openCancelModal(selectedOrder)"
              class="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 btn-press">
              Batalkan Pesanan
            </button>
            <button type="button" (click)="openChangePaymentModal(selectedOrder)"
              class="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 btn-press">
              Ubah Metode Bayar
            </button>
          </div>
          <div class="flex items-center gap-2 ml-auto">
            <button *ngIf="selectedOrder.status === 'PENDING'" type="button" (click)="payNow(selectedOrder)" [disabled]="payingOrderId === selectedOrder.id"
              class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all btn-press disabled:opacity-50">
              {{ payingOrderId === selectedOrder.id ? 'Memproses...' : 'Bayar Sekarang' }}
            </button>
            <button (click)="closeDetailModal()"
              class="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors btn-press">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Order Confirmation Modal (ORDER-PAYMENT-FIX-001) -->
    <div *ngIf="orderToCancel" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Batalkan Pesanan</h3>
            <p class="text-xs text-slate-400 font-mono">#{{ orderToCancel.id }}</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
          Apakah Anda yakin ingin membatalkan pesanan ini? Pembatalan tidak dapat diurungkan dan kuantitas stok produk akan otomatis dikembalikan ke inventaris toko.
        </p>

        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button type="button" (click)="closeCancelModal()" [disabled]="isCancelling"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Batal
          </button>
          <button type="button" (click)="confirmCancelOrder()" [disabled]="isCancelling"
            class="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50 btn-press">
            <span *ngIf="!isCancelling">Ya, Batalkan Pesanan</span>
            <span *ngIf="isCancelling">Membatalkan...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Change Payment Method Modal (ORDER-PAYMENT-FIX-001) -->
    <div *ngIf="orderToChangePayment" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              💳
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Ubah Metode Pembayaran</h3>
              <p class="text-xs text-slate-400 font-mono">#{{ orderToChangePayment.id.substring(0, 8) }}...</p>
            </div>
          </div>
          <button (click)="closeChangePaymentModal()" class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-bold text-slate-700">Pilih Metode Pembayaran Baru:</label>
          <div class="space-y-2">
            <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
              [ngClass]="selectedNewPaymentMethod === 'QRIS' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'">
              <input type="radio" name="changeMethod" value="QRIS" [(ngModel)]="selectedNewPaymentMethod" class="mt-0.5 text-indigo-600 focus:ring-indigo-500">
              <div class="text-xs">
                <span class="font-bold block">QRIS / Instant Payment (Midtrans Snap)</span>
                <span class="text-slate-500 text-[11px]">Scan QRIS menggunakan GoPay, ShopeePay, DANA, atau mobile banking.</span>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
              [ngClass]="selectedNewPaymentMethod === 'VA' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'">
              <input type="radio" name="changeMethod" value="VA" [(ngModel)]="selectedNewPaymentMethod" class="mt-0.5 text-indigo-600 focus:ring-indigo-500">
              <div class="text-xs">
                <span class="font-bold block">Transfer Virtual Account (BCA / BNI / BRI / Mandiri)</span>
                <span class="text-slate-500 text-[11px]">Nomor VA unik akan disediakan saat membuka jendela pembayaran.</span>
              </div>
            </label>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <button type="button" (click)="closeChangePaymentModal()" [disabled]="isUpdatingPaymentMethod"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Batal
          </button>
          <button type="button" (click)="confirmChangePaymentMethod()" [disabled]="isUpdatingPaymentMethod"
            class="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl shadow-sm transition-all disabled:opacity-50 btn-press">
            <span *ngIf="!isUpdatingPaymentMethod">Simpan & Lanjutkan Bayar</span>
            <span *ngIf="isUpdatingPaymentMethod">Memperbarui...</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);
  private uploadService = inject(UploadService);
  private route = inject(ActivatedRoute);

  isUploadingDoc = false;
  uploadedDocs: { [orderId: string]: { fileName: string; fileSize: string; url: string; isPdf: boolean } } = {};

  /** ID pesanan yang sedang diproses pembayarannya (untuk loading state tombol). */
  payingOrderId: string | null = null;

  // ORDER-PAYMENT-FIX-001: Modal states
  orderToCancel: OrderResponse | null = null;
  isCancelling = false;

  orderToChangePayment: OrderResponse | null = null;
  selectedNewPaymentMethod = 'QRIS';
  isUpdatingPaymentMethod = false;

  orders: OrderResponse[] = [];
  pageData: PageResponse<OrderResponse> | null = null;
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  selectedStatus = 'ALL';

  readonly statusOptions = [
    { label: 'Semua Pesanan', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Dibayar', value: 'PAID' },
    { label: 'Dikirim', value: 'SHIPPED' },
    { label: 'Diterima', value: 'DELIVERED' },
    { label: 'Selesai', value: 'COMPLETED' },
    { label: 'Dibatalkan', value: 'CANCELLED' }
  ];

  selectedOrder: OrderResponse | null = null;

  ngOnInit(): void {
    this.loadOrders();

    // Check if deep linked via query param ?id=...
    this.route.queryParams.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.fetchOrderById(orderId);
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders(this.currentPage, this.pageSize, this.selectedStatus)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.pageData = res.data;
            this.orders = res.data.content;
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Pesanan', 'Gagal memuat riwayat pesanan');
          this.isLoading = false;
        }
      });
  }

  fetchOrderById(id: string): void {
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        if (res.data) {
          this.selectedOrder = res.data;
        }
      },
      error: () => {
        // Silently ignore or show info
      }
    });
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadOrders();
  }

  changePage(page: number): void {
    if (page >= 0 && (!this.pageData || page < this.pageData.totalPages)) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  getPagesArray(): number[] {
    if (!this.pageData) return [];
    return Array.from({ length: this.pageData.totalPages }, (_, i) => i);
  }

  getEndIndex(): number {
    if (!this.pageData) return 0;
    return Math.min((this.currentPage + 1) * this.pageSize, this.pageData.totalElements);
  }

  openDetailModal(order: OrderResponse): void {
    this.selectedOrder = order;
    if (order.paymentProofUrl && !this.uploadedDocs[order.id]) {
      const isPdf = order.paymentProofUrl.toLowerCase().endsWith('.pdf');
      this.uploadedDocs[order.id] = {
        fileName: isPdf ? 'Dokumen_Bukti_Transaksi.pdf' : 'Bukti_Pembayaran.jpg',
        fileSize: 'Tersimpan di Sistem',
        url: order.paymentProofUrl,
        isPdf: isPdf
      };
    }
  }

  closeDetailModal(): void {
    this.selectedOrder = null;
  }

  // ORDER-PAYMENT-FIX-001: Cancel Order Handlers
  openCancelModal(order: OrderResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.orderToCancel = order;
  }

  closeCancelModal(): void {
    if (this.isCancelling) return;
    this.orderToCancel = null;
  }

  confirmCancelOrder(): void {
    if (!this.orderToCancel) return;
    this.isCancelling = true;
    const orderId = this.orderToCancel.id;

    this.orderService.cancelOrder(orderId).subscribe({
      next: (res) => {
        this.isCancelling = false;
        this.toastService.success('Pesanan Dibatalkan', 'Pesanan berhasil dibatalkan dan stok produk telah dikembalikan.');
        this.closeCancelModal();

        // Update local state
        if (res.data) {
          const updated = res.data;
          const idx = this.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            this.orders[idx] = updated;
          }
          if (this.selectedOrder && this.selectedOrder.id === orderId) {
            this.selectedOrder = updated;
          }
        } else {
          this.loadOrders();
        }
      },
      error: (err) => {
        this.isCancelling = false;
        this.toastService.error('Gagal Membatalkan', err.error?.message || 'Pesanan tidak dapat dibatalkan.');
      }
    });
  }

  // ORDER-PAYMENT-FIX-001: Change Payment Method Handlers
  openChangePaymentModal(order: OrderResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.orderToChangePayment = order;
    this.selectedNewPaymentMethod = order.paymentMethod || 'QRIS';
  }

  closeChangePaymentModal(): void {
    if (this.isUpdatingPaymentMethod) return;
    this.orderToChangePayment = null;
  }

  confirmChangePaymentMethod(): void {
    if (!this.orderToChangePayment) return;
    this.isUpdatingPaymentMethod = true;
    const targetOrder = this.orderToChangePayment;
    const orderId = targetOrder.id;
    const newMethod = this.selectedNewPaymentMethod;

    this.orderService.updatePaymentMethod(orderId, newMethod).subscribe({
      next: (res) => {
        this.isUpdatingPaymentMethod = false;
        this.toastService.success('Metode Pembayaran Diperbarui', `Metode pembayaran berhasil diubah ke ${newMethod}.`);
        this.closeChangePaymentModal();

        if (res.data) {
          const updated = res.data;
          const idx = this.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            this.orders[idx] = updated;
          }
          if (this.selectedOrder && this.selectedOrder.id === orderId) {
            this.selectedOrder = updated;
          }
          // Segera panggil bayar sekarang dengan Snap token baru
          this.payNow(updated);
        } else {
          this.loadOrders();
        }
      },
      error: (err) => {
        this.isUpdatingPaymentMethod = false;
        this.toastService.error('Gagal Mengubah Metode', err.error?.message || 'Tidak dapat memperbarui metode pembayaran.');
      }
    });
  }

  /**
   * Memulai proses pembayaran Midtrans Snap untuk pesanan dengan status PENDING.
   */
  payNow(order: OrderResponse): void {
    if (this.payingOrderId) return; // Cegah double click
    this.payingOrderId = order.id;

    this.paymentService.createPayment(order.id).subscribe({
      next: async (payRes) => {
        const snapToken = payRes.data?.snapToken;
        if (!snapToken) {
          this.payingOrderId = null;
          this.toastService.warning('Pembayaran', 'Token pembayaran tidak tersedia. Coba lagi beberapa saat.');
          return;
        }

        try {
          await this.paymentService.initAndOpenSnap(snapToken, {
            onSuccess: () => {
              this.payingOrderId = null;
              this.toastService.success('Pembayaran Berhasil', 'Transaksi Anda telah berhasil dikonfirmasi.');
              this.loadOrders();
            },
            onPending: () => {
              this.payingOrderId = null;
              this.toastService.info('Menunggu Pembayaran', 'Selesaikan pembayaran Anda sesuai instruksi.');
              this.loadOrders();
            },
            onError: () => {
              this.payingOrderId = null;
              this.toastService.error('Pembayaran Gagal', 'Terjadi kesalahan. Silakan coba bayar kembali.');
            },
            onClose: () => {
              this.payingOrderId = null;
              this.toastService.warning('Pembayaran Dibatalkan', 'Jendela pembayaran ditutup. Pesanan masih tersimpan.');
            }
          });
        } catch {
          this.payingOrderId = null;
          this.toastService.error('Gagal Memuat Pembayaran', 'Tidak dapat terhubung ke sistem pembayaran.');
        }
      },
      error: (err) => {
        this.payingOrderId = null;
        this.toastService.error('Token Gagal', err.error?.message || 'Gagal mendapatkan token pembayaran.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-amber-500';
      case 'PAID': return 'bg-blue-500';
      case 'SHIPPED': return 'bg-indigo-500';
      case 'DELIVERED':
      case 'COMPLETED': return 'bg-emerald-500';
      case 'CANCELLED': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  }

  getStepClass(stepNumber: number, status: string): string {
    const statusOrder: { [key: string]: number } = {
      'PENDING': 1,
      'PAID': 2,
      'SHIPPED': 3,
      'DELIVERED': 4,
      'COMPLETED': 4,
      'CANCELLED': 0
    };

    const currentStep = statusOrder[status] || 0;
    if (status === 'CANCELLED') {
      return 'bg-rose-100 text-rose-700 border border-rose-300';
    }

    if (currentStep >= stepNumber) {
      return 'bg-emerald-600 text-white font-bold shadow-sm';
    }
    return 'bg-slate-100 text-slate-400 border border-slate-200';
  }

  onDocumentSelected(event: Event, orderId: string): void {
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

        const docUrl = res.data || '';
        this.uploadedDocs[orderId] = {
          fileName: file.name,
          fileSize: sizeFormatted,
          url: docUrl,
          isPdf: isPdf
        };

        // FINDING-003: Persistensi URL dokumen bukti pembayaran ke database order
        this.orderService.updatePaymentProof(orderId, docUrl).subscribe({
          next: () => {
            this.isUploadingDoc = false;
            if (this.selectedOrder && this.selectedOrder.id === orderId) {
              this.selectedOrder.paymentProofUrl = docUrl;
            }
            const idx = this.orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
              this.orders[idx].paymentProofUrl = docUrl;
            }
            this.toastService.success('Tersimpan', isPdf ? 'Dokumen PDF bukti pembayaran berhasil disimpan ke pesanan' : 'Bukti pembayaran berhasil disimpan ke pesanan');
            input.value = '';
          },
          error: (err) => {
            this.isUploadingDoc = false;
            this.toastService.error('Gagal Menyimpan', err.error?.message || 'Gagal menyimpan lampiran bukti pembayaran ke pesanan');
            input.value = '';
          }
        });
      },
      error: (err) => {
        this.isUploadingDoc = false;
        this.toastService.error('Unggah Gagal', err.error?.message || 'Gagal mengunggah dokumen bukti pembayaran');
        input.value = '';
      }
    });
  }

  removeDocument(orderId: string): void {
    this.orderService.updatePaymentProof(orderId, '').subscribe({
      next: () => {
        delete this.uploadedDocs[orderId];
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder.paymentProofUrl = undefined;
        }
        const idx = this.orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          this.orders[idx].paymentProofUrl = undefined;
        }
        this.toastService.info('Dokumen Dihapus', 'Lampiran bukti pembayaran telah dihapus dari pesanan');
      },
      error: (err) => {
        this.toastService.error('Gagal Menghapus', err.error?.message || 'Gagal menghapus dokumen dari pesanan');
      }
    });
  }
}
