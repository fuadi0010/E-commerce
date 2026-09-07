import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
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
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button (click)="closeDetailModal()"
            class="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors btn-press">
            Tutup
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private uploadService = inject(UploadService);
  private route = inject(ActivatedRoute);

  isUploadingDoc = false;
  uploadedDocs: { [orderId: string]: { fileName: string; fileSize: string; url: string; isPdf: boolean } } = {};

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
  }

  closeDetailModal(): void {
    this.selectedOrder = null;
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

        this.uploadedDocs[orderId] = {
          fileName: file.name,
          fileSize: sizeFormatted,
          url: res.data || '',
          isPdf: isPdf
        };

        this.isUploadingDoc = false;
        this.toastService.success('Unggah Berhasil', isPdf ? 'Dokumen PDF bukti pembayaran berhasil diunggah' : 'Bukti pembayaran berhasil diunggah');
        input.value = '';
      },
      error: (err) => {
        this.isUploadingDoc = false;
        this.toastService.error('Unggah Gagal', err.error?.message || 'Gagal mengunggah dokumen bukti pembayaran');
        input.value = '';
      }
    });
  }

  removeDocument(orderId: string): void {
    delete this.uploadedDocs[orderId];
    this.toastService.info('Dokumen Dihapus', 'Lampiran bukti pembayaran telah dilepas');
  }
}
