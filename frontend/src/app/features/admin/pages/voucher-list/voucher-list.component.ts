import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VoucherService } from '../../../../core/services/voucher.service';
import { Voucher, CreateVoucherRequest, UpdateVoucherRequest, DiscountType } from '../../../../core/models/voucher.model';
import { PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-voucher-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-4">
      <!-- Back to Dashboard -->
      <a routerLink="/admin/dashboard" class="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span>Kembali ke Dashboard</span>
      </a>

      <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Manajemen Voucher & Kupon Promo (Entitas Utama ke-6)</h2>
            <p class="text-xs text-slate-400 mt-0.5">Kelola kode diskon promosi belanja, kuota kupon, dan masa berlaku voucher</p>
          </div>
          <button (click)="openCreateModal()" class="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all gap-2 btn-press self-start sm:self-auto shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Tambah Voucher Baru</span>
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <!-- Search Box -->
          <div class="flex items-center gap-2 flex-1 max-w-sm">
            <div class="relative w-full">
              <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="onSearch()"
                placeholder="Cari kode atau deskripsi voucher..."
                class="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100">
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button (click)="onSearch()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
              Cari
            </button>
          </div>

          <!-- Status Filter & Page Size -->
          <div class="flex items-center gap-3 text-xs ml-auto">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500">Status:</span>
              <select [(ngModel)]="selectedStatusFilter" (change)="onStatusFilterChange()"
                class="border border-slate-200 rounded-xl py-1 px-2.5 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="ALL">Semua</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-slate-500">Tampilkan:</span>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()"
                class="border border-slate-200 rounded-xl py-1 px-2 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100">
                <option [ngValue]="5">5</option>
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="p-16 flex flex-col items-center justify-center space-y-3">
          <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs text-slate-400">Memuat data voucher...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && vouchers.length === 0" class="p-16 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            🏷️
          </div>
          <h3 class="text-sm font-bold text-slate-900">Tidak Ada Voucher Ditemukan</h3>
          <p class="text-xs text-slate-400">Belum ada data voucher yang cocok dengan filter yang dipilih.</p>
        </div>

        <!-- Table -->
        <div *ngIf="!isLoading && vouchers.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" class="px-6 py-3.5">Kode & Deskripsi</th>
                <th scope="col" class="px-6 py-3.5">Tipe & Nilai Diskon</th>
                <th scope="col" class="px-6 py-3.5">Min. Belanja</th>
                <th scope="col" class="px-6 py-3.5">Penggunaan Kuota</th>
                <th scope="col" class="px-6 py-3.5">Masa Berlaku</th>
                <th scope="col" class="px-6 py-3.5">Status</th>
                <th scope="col" class="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let v of vouchers" class="hover:bg-slate-50/60 transition-colors">
                <!-- Code & Description -->
                <td class="px-6 py-4">
                  <span class="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 inline-block mb-1">
                    {{ v.code }}
                  </span>
                  <div class="text-[11px] text-slate-500 line-clamp-1" [title]="v.description">
                    {{ v.description }}
                  </div>
                </td>

                <!-- Discount Type & Value -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-slate-900">
                    <span *ngIf="v.discountType === 'PERCENTAGE'">{{ v.discountValue }}%</span>
                    <span *ngIf="v.discountType === 'FIXED'">Rp {{ v.discountValue | number:'1.0-0' }}</span>
                  </div>
                  <div *ngIf="v.maxDiscount" class="text-[10px] text-slate-400">
                    Maks. Rp {{ v.maxDiscount | number:'1.0-0' }}
                  </div>
                </td>

                <!-- Min Purchase -->
                <td class="px-6 py-4 whitespace-nowrap text-slate-700">
                  Rp {{ v.minPurchase | number:'1.0-0' }}
                </td>

                <!-- Quota -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-semibold text-slate-800">
                    {{ v.usedCount }} / {{ v.quota }}
                  </div>
                  <div class="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div class="bg-indigo-600 h-full rounded-full" [style.width.%]="(v.usedCount / v.quota) * 100"></div>
                  </div>
                </td>

                <!-- Valid Until -->
                <td class="px-6 py-4 whitespace-nowrap text-[11px] text-slate-500">
                  {{ v.validUntil | date:'dd MMM yyyy, HH:mm' }}
                </td>

                <!-- Status & Toggle -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <button (click)="toggleStatus(v)"
                    [ngClass]="v.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors inline-flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="v.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    {{ v.isActive ? 'Aktif' : 'Nonaktif' }}
                  </button>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                  <button (click)="openEditModal(v)" class="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                    Ubah
                  </button>
                  <button (click)="deleteVoucher(v)" class="text-rose-600 hover:text-rose-900 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors">
                    Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="pageData && pageData.totalElements > 0" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Menampilkan <span class="font-bold text-slate-900">{{ (currentPage * pageSize) + 1 }}</span>
            sampai <span class="font-bold text-slate-900">{{ getEndIndex() }}</span>
            dari total <span class="font-bold text-slate-900">{{ pageData.totalElements }}</span> voucher
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

    <!-- Create / Edit Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">{{ isEditing ? 'Ubah Data Voucher' : 'Buat Voucher Promo Baru' }}</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form (ngSubmit)="submitForm()" class="space-y-3.5 text-xs">
          <!-- Code -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kode Voucher:</label>
            <input type="text" [(ngModel)]="formCode" name="code" [disabled]="isEditing" required
              placeholder="Contoh: PROMOHEMAT50"
              class="w-full p-2.5 border border-slate-200 rounded-xl uppercase font-mono font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
          </div>

          <!-- Description -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Voucher:</label>
            <input type="text" [(ngModel)]="formDescription" name="description" required
              placeholder="Contoh: Diskon 20% khusus akhir pekan"
              class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
          </div>

          <!-- Discount Type & Value -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tipe Diskon:</label>
              <select [(ngModel)]="formDiscountType" name="discountType"
                class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Nilai Diskon:</label>
              <input type="number" [(ngModel)]="formDiscountValue" name="discountValue" required min="1"
                [placeholder]="formDiscountType === 'PERCENTAGE' ? 'Contoh: 20' : 'Contoh: 50000'"
                class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
            </div>
          </div>

          <!-- Min Purchase & Max Discount -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Minimal Belanja (Rp):</label>
              <input type="number" [(ngModel)]="formMinPurchase" name="minPurchase" min="0" placeholder="0"
                class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Maks. Diskon (Rp, opsional):</label>
              <input type="number" [(ngModel)]="formMaxDiscount" name="maxDiscount" min="1" placeholder="Kosongkan jika bebas"
                class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
            </div>
          </div>

          <!-- Quota & Valid Until -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kuota Pemakaian:</label>
              <input type="number" [(ngModel)]="formQuota" name="quota" min="1" required
                class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Berlaku Sampai Tanggal:</label>
              <input type="date" [(ngModel)]="formValidDate" name="validDate" required
                class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" (click)="closeModal()" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              Batal
            </button>
            <button type="submit" [disabled]="isSubmitting"
              class="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl shadow-sm">
              <span *ngIf="!isSubmitting">Simpan Voucher</span>
              <span *ngIf="isSubmitting">Menyimpan...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VoucherListComponent implements OnInit {
  private voucherService = inject(VoucherService);
  private toastService = inject(ToastService);

  vouchers: Voucher[] = [];
  pageData: PageResponse<Voucher> | null = null;
  isLoading = false;
  isSubmitting = false;

  currentPage = 0;
  pageSize = 10;
  searchKeyword = '';
  selectedStatusFilter = 'ALL';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingId: string | null = null;

  formCode = '';
  formDescription = '';
  formDiscountType: DiscountType = 'PERCENTAGE';
  formDiscountValue = 10;
  formMinPurchase = 50000;
  formMaxDiscount: number | null = null;
  formQuota = 100;
  formValidDate = '';

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.isLoading = true;
    let isActiveParam: boolean | undefined = undefined;
    if (this.selectedStatusFilter === 'ACTIVE') isActiveParam = true;
    if (this.selectedStatusFilter === 'INACTIVE') isActiveParam = false;

    this.voucherService.getAllVouchersAdmin(this.currentPage, this.pageSize, this.searchKeyword, isActiveParam)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.pageData = res.data;
            this.vouchers = res.data.content;
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Voucher', 'Gagal memuat daftar voucher');
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadVouchers();
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadVouchers();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadVouchers();
  }

  changePage(page: number): void {
    if (page >= 0 && (!this.pageData || page < this.pageData.totalPages)) {
      this.currentPage = page;
      this.loadVouchers();
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

  toggleStatus(v: Voucher): void {
    this.voucherService.toggleVoucherStatus(v.id).subscribe({
      next: (res) => {
        if (res.data) {
          v.isActive = res.data.isActive;
          this.toastService.success('Status Berubah', `Voucher ${v.code} berhasil di-${v.isActive ? 'aktifkan' : 'nonaktifkan'}`);
        }
      },
      error: () => {
        this.toastService.error('Gagal', 'Gagal mengubah status voucher');
      }
    });
  }

  deleteVoucher(v: Voucher): void {
    if (!confirm(`Apakah Anda yakin ingin menghapus voucher ${v.code}?`)) return;

    this.voucherService.deleteVoucher(v.id).subscribe({
      next: () => {
        this.toastService.success('Berhasil', `Voucher ${v.code} berhasil dihapus`);
        this.loadVouchers();
      },
      error: () => {
        this.toastService.error('Gagal', 'Gagal menghapus voucher');
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formCode = '';
    this.formDescription = '';
    this.formDiscountType = 'PERCENTAGE';
    this.formDiscountValue = 10;
    this.formMinPurchase = 50000;
    this.formMaxDiscount = null;
    this.formQuota = 100;
    
    // Default valid until 30 days from now in YYYY-MM-DD
    const d = new Date();
    d.setDate(d.getDate() + 30);
    this.formValidDate = d.toISOString().split('T')[0];

    this.isModalOpen = true;
  }

  openEditModal(v: Voucher): void {
    this.isEditing = true;
    this.editingId = v.id;
    this.formCode = v.code;
    this.formDescription = v.description;
    this.formDiscountType = v.discountType;
    this.formDiscountValue = v.discountValue;
    this.formMinPurchase = v.minPurchase;
    this.formMaxDiscount = v.maxDiscount || null;
    this.formQuota = v.quota;
    this.formValidDate = v.validUntil ? v.validUntil.split('T')[0] : '';

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingId = null;
  }

  submitForm(): void {
    if (!this.formDescription || !this.formValidDate) return;

    const validUntilIso = new Date(this.formValidDate + 'T23:59:59Z').toISOString();

    this.isSubmitting = true;

    if (this.isEditing && this.editingId) {
      const updateReq: UpdateVoucherRequest = {
        description: this.formDescription,
        discountType: this.formDiscountType,
        discountValue: this.formDiscountValue,
        minPurchase: this.formMinPurchase,
        maxDiscount: this.formMaxDiscount || undefined,
        quota: this.formQuota,
        validUntil: validUntilIso
      };

      this.voucherService.updateVoucher(this.editingId, updateReq).subscribe({
        next: () => {
          this.toastService.success('Berhasil', 'Data voucher berhasil diperbarui');
          this.isSubmitting = false;
          this.closeModal();
          this.loadVouchers();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error('Gagal', err.error?.message || 'Gagal memperbarui voucher');
        }
      });
    } else {
      const createReq: CreateVoucherRequest = {
        code: this.formCode,
        description: this.formDescription,
        discountType: this.formDiscountType,
        discountValue: this.formDiscountValue,
        minPurchase: this.formMinPurchase,
        maxDiscount: this.formMaxDiscount || undefined,
        quota: this.formQuota,
        validUntil: validUntilIso
      };

      this.voucherService.createVoucher(createReq).subscribe({
        next: () => {
          this.toastService.success('Berhasil', 'Voucher baru berhasil dibuat');
          this.isSubmitting = false;
          this.closeModal();
          this.loadVouchers();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error('Gagal', err.error?.message || 'Gagal membuat voucher');
        }
      });
    }
  }
}
