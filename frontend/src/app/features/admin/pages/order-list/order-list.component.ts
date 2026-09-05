import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { OrderResponse } from '../../../../core/models/order.model';
import { PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Manajemen Pesanan (Admin)</h2>
          <p class="text-xs text-slate-400 mt-0.5">Pantau riwayat transaksi, verifikasi pembayaran, dan perbarui status pesanan pembeli</p>
        </div>
        <button (click)="loadOrders()" class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all gap-2 btn-press self-start sm:self-auto">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Segarkan Data</span>
        </button>
      </div>

      <!-- Filters Toolbar -->
      <div class="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <!-- Status Filter Tabs / Select -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button *ngFor="let s of statusOptions"
            (click)="selectStatus(s.value)"
            [ngClass]="selectedStatus === s.value ? 'bg-slate-900 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
            class="px-3 py-1.5 text-xs rounded-xl transition-all whitespace-nowrap">
            {{ s.label }}
          </button>
        </div>

        <!-- Page Size Selector -->
        <div class="flex items-center gap-2 text-xs text-slate-500 ml-auto">
          <span>Tampilkan:</span>
          <select [(ngModel)]="pageSize" (change)="onPageSizeChange()"
            class="text-xs border border-slate-200 rounded-xl py-1 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
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
        <span class="text-xs text-slate-400">Memuat data pesanan...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && orders.length === 0" class="p-16 text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
        </div>
        <h3 class="text-sm font-bold text-slate-900">Tidak Ada Pesanan Ditemukan</h3>
        <p class="text-xs text-slate-400">Belum ada pesanan dengan filter status yang dipilih.</p>
      </div>

      <!-- Orders Table -->
      <div *ngIf="!isLoading && orders.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" class="px-6 py-3.5">ID Pesanan & Waktu</th>
              <th scope="col" class="px-6 py-3.5">Item Pembelian</th>
              <th scope="col" class="px-6 py-3.5">Total Belanja</th>
              <th scope="col" class="px-6 py-3.5">Status</th>
              <th scope="col" class="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let order of orders" class="hover:bg-slate-50/60 transition-colors">
              <!-- ID & Date -->
              <td class="px-6 py-4">
                <div class="font-mono text-xs font-bold text-slate-900" [title]="order.id">
                  #{{ order.id.substring(0, 8) }}...
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  {{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}
                </div>
              </td>

              <!-- Items Summary -->
              <td class="px-6 py-4">
                <div class="text-xs font-medium text-slate-800">
                  {{ order.items.length }} jenis barang
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  <span *ngFor="let item of order.items; let last = last">
                    {{ item.product.name }} (x{{ item.quantity }}){{ last ? '' : ', ' }}
                  </span>
                </div>
              </td>

              <!-- Total Amount -->
              <td class="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900">
                Rp {{ order.totalAmount | number:'1.0-0' }}
              </td>

              <!-- Status Badge -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusBadgeClass(order.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border">
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" [class]="getStatusDotClass(order.status)"></span>
                  {{ order.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                <button (click)="openStatusModal(order)"
                  class="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 px-3 py-1.5 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  <span>Ubah Status</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Toolbar -->
      <div *ngIf="pageData && pageData.totalElements > 0" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Menampilkan <span class="font-bold text-slate-900">{{ (currentPage * pageSize) + 1 }}</span>
          sampai <span class="font-bold text-slate-900">{{ getEndIndex() }}</span>
          dari total <span class="font-bold text-slate-900">{{ pageData.totalElements }}</span> pesanan
        </div>

        <!-- Page Numbers List -->
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

    <!-- Status Update Modal -->
    <div *ngIf="isModalOpen && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Perbarui Status Pesanan</h3>
            <p class="text-xs text-slate-400 font-mono mt-0.5">#{{ selectedOrder.id }}</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="py-5 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Pilih Status Baru:</label>
            <div class="grid grid-cols-1 gap-2">
              <label *ngFor="let st of updateableStatuses"
                class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                [ngClass]="newStatus === st ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'">
                <input type="radio" name="orderStatus" [value]="st" [(ngModel)]="newStatus" class="text-indigo-600 focus:ring-indigo-500">
                <span class="text-xs">{{ st }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button (click)="closeModal()" [disabled]="isSubmitting"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Batal
          </button>
          <button (click)="submitStatusUpdate()" [disabled]="isSubmitting"
            class="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl shadow-sm transition-all disabled:opacity-50">
            <span *ngIf="!isSubmitting">Simpan Perubahan</span>
            <span *ngIf="isSubmitting">Menyimpan...</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  orders: OrderResponse[] = [];
  pageData: PageResponse<OrderResponse> | null = null;
  isLoading = false;
  isSubmitting = false;
  currentPage = 0;
  pageSize = 10;
  selectedStatus = 'ALL';

  readonly statusOptions = [
    { label: 'Semua Status', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  readonly updateableStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Modal state
  isModalOpen = false;
  selectedOrder: OrderResponse | null = null;
  newStatus = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrdersAdmin(this.currentPage, this.pageSize, this.selectedStatus)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.pageData = res.data;
            this.orders = res.data.content;
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Pesanan', 'Gagal memuat daftar pesanan');
          this.isLoading = false;
        }
      });
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadOrders();
  }

  onPageSizeChange(): void {
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'DELIVERED':
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
      case 'DELIVERED': return 'bg-emerald-500';
      case 'CANCELLED': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  }

  openStatusModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.newStatus = order.status;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.newStatus = '';
  }

  submitStatusUpdate(): void {
    if (!this.selectedOrder || !this.newStatus) return;

    this.isSubmitting = true;
    this.orderService.updateOrderStatus(this.selectedOrder.id, this.newStatus)
      .subscribe({
        next: () => {
          this.toastService.success('Berhasil', 'Status pesanan berhasil diperbarui');
          this.isSubmitting = false;
          this.closeModal();
          this.loadOrders();
        },
        error: () => {
          this.toastService.error('Gagal', 'Gagal memperbarui status pesanan');
          this.isSubmitting = false;
        }
      });
  }
}
