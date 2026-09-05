import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TokenService } from '../../../../core/services/token.service';
import { OrderService } from '../../../../core/services/order.service';
import { OrderResponse } from '../../../../core/models/order.model';
import { PageResponse } from '../../../../core/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Welcome Header Banner -->
      <div class="relative rounded-3xl bg-slate-900 text-white p-7 sm:p-10 overflow-hidden border border-slate-800 shadow-ambient-lg">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 space-y-3 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-300 border border-white/15 uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="isAdmin ? 'bg-indigo-400' : 'bg-emerald-400'"></span>
            {{ isAdmin ? 'Pusat Kendali Admin' : 'Area Member' }}
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {{ isAdmin ? 'Selamat Datang di Admin Console' : 'Selamat Datang Kembali!' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {{ isAdmin 
                ? 'Pantau metrik penjualan toko, kelola inventaris produk, dan tinjau status pemesanan pelanggan secara terpusat.' 
                : 'Kelola pesanan, periksa status pengiriman terbaru, dan tinjau riwayat transaksi akun Anda secara terpusat.' }}
          </p>
        </div>
      </div>

      <!-- Real Metrics Cards (Rule 49: Dilarang hardcoded statis) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <!-- Metric 1: Total Orders -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-ambient space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              {{ isAdmin ? 'Total Pesanan Toko' : 'Total Pesanan' }}
            </span>
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
          <div class="text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ totalOrders }}
          </div>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{{ isAdmin ? 'Semua pesanan pelanggan' : 'Riwayat akun keseluruhan' }}</span>
            <span class="text-indigo-600 font-semibold">{{ isAdmin ? 'Platform' : 'Aktif' }}</span>
          </div>
        </div>

        <!-- Metric 2: Total Spending / Revenue -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-ambient space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              {{ isAdmin ? 'Total Pendapatan (Gross)' : 'Total Belanja' }}
            </span>
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            Rp {{ totalSpending | number:'1.0-0' }}
          </div>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{{ isAdmin ? 'Akumulasi omset penjualan' : 'Akumulasi transaksi saya' }}</span>
            <span class="text-emerald-600 font-semibold">IDR</span>
          </div>
        </div>

        <!-- Metric 3: Pending Orders -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-ambient space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              {{ isAdmin ? 'Pesanan Perlu Diproses' : 'Pesanan Berjalan' }}
            </span>
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="text-3xl font-extrabold text-amber-600 tracking-tight">
            {{ pendingOrdersCount }}
          </div>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{{ isAdmin ? 'Menunggu verifikasi / kirim' : 'Status diproses / dikirim' }}</span>
            <span class="text-amber-600 font-semibold">Realtime</span>
          </div>
        </div>

      </div>

      <!-- Quick Action Shortcuts -->
      <div class="flex flex-wrap gap-3">
        <!-- Admin Shortcuts -->
        <ng-container *ngIf="isAdmin">
          <a routerLink="/admin/products" class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all btn-press">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span>Manajemen Produk</span>
          </a>
          <a routerLink="/admin/categories" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all btn-press">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <span>Manajemen Kategori</span>
          </a>
          <a routerLink="/admin/orders" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all btn-press">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>Manajemen Pesanan</span>
          </a>
        </ng-container>

        <!-- Customer Shortcuts -->
        <ng-container *ngIf="!isAdmin">
          <a routerLink="/catalog" class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all btn-press">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>Jelajahi Katalog Produk</span>
          </a>
          <a routerLink="/cart" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all btn-press">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>Buka Keranjang Belanja</span>
          </a>
          <a routerLink="/profile" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all btn-press">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>Pengaturan Akun & Profil</span>
          </a>
        </ng-container>
      </div>

      <!-- Order History Table -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-ambient overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">
              {{ isAdmin ? 'Pesanan Masuk Terbaru' : 'Riwayat Pesanan Terakhir' }}
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ isAdmin 
                  ? 'Daftar transaksi pesanan masuk pelanggan yang perlu diverifikasi atau dikirim' 
                  : 'Daftar transaksi dan rincian status pemesanan akun Anda' }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <a *ngIf="isAdmin" routerLink="/admin/orders" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
              Buka Manajemen Pesanan &rarr;
            </a>
            <button (click)="loadOrders()" 
              class="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Perbarui</span>
            </button>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-16 space-y-3">
          <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs text-slate-400">Memuat data pesanan...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && orders.length === 0" class="text-center py-16 px-4 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              {{ isAdmin ? 'Belum Ada Pesanan Masuk' : 'Belum Ada Transaksi' }}
            </h3>
            <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {{ isAdmin 
                  ? 'Belum ada transaksi pesanan yang dilakukan oleh pelanggan.' 
                  : 'Anda belum pernah membuat pesanan apapun. Mulai temukan produk favorit Anda!' }}
            </p>
          </div>
          <a *ngIf="!isAdmin" routerLink="/catalog" 
            class="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors btn-press">
            Buka Katalog
          </a>
        </div>

        <!-- Table Data -->
        <div *ngIf="!isLoading && orders.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left">
            <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" class="px-6 py-3.5">ID Pesanan</th>
                <th scope="col" class="px-6 py-3.5">Tanggal</th>
                <th scope="col" class="px-6 py-3.5">Jumlah Item</th>
                <th scope="col" class="px-6 py-3.5">Total Tagihan</th>
                <th scope="col" class="px-6 py-3.5">Status Pesanan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let order of orders" class="hover:bg-slate-50/60 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-indigo-600">
                  #{{ order.id ? order.id.substring(0, 8) : '-' }}...
                </td>
                <td class="px-6 py-4 text-slate-600">
                  {{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}
                </td>
                <td class="px-6 py-4 text-slate-600">
                  {{ order.items ? order.items.length : 0 }} barang
                </td>
                <td class="px-6 py-4 font-extrabold text-slate-900">
                  Rp {{ order.totalAmount | number:'1.0-0' }}
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                    [ngClass]="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private tokenService = inject(TokenService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders: OrderResponse[] = [];
  pageData: PageResponse<OrderResponse> | null = null;
  isLoading = false;
  isAdmin = false;

  get userEmail(): string {
    const user = this.tokenService.getUserInfo();
    return user ? user.email : 'User';
  }

  get totalOrders(): number {
    return this.pageData?.totalElements || this.orders.length;
  }

  get totalSpending(): number {
    return this.orders.reduce((acc, order) => {
      const amount = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount as any) || 0;
      return acc + amount;
    }, 0);
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'PENDING' || o.status === 'SHIPPED').length;
  }

  ngOnInit() {
    const user = this.tokenService.getUserInfo();
    this.isAdmin = this.router.url.startsWith('/admin') || (user?.roles?.includes('ROLE_ADMIN') ?? false);
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    const request$ = this.isAdmin
      ? this.orderService.getAllOrdersAdmin(0, 100)
      : this.orderService.getMyOrders(0, 100);

    request$.subscribe({
      next: (response) => {
        if (response.data) {
          this.pageData = response.data;
          this.orders = response.data.content;
        }
      },
      error: (error) => {
        console.error('Failed to load orders', error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border border-blue-200/50';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200/50';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border border-rose-200/50';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
