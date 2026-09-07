import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserResponse } from '../../../../core/models/user.model';
import { PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-4">
      <!-- Back to Dashboard Navigation -->
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
            <h2 class="text-base font-bold text-slate-900">Manajemen Pengguna (Admin User Management)</h2>
            <p class="text-xs text-slate-400 mt-0.5">Kelola data pelanggan terdaftar, periksa hak akses role, dan moderasi akun</p>
          </div>
          <button (click)="loadUsers()" class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all gap-2 btn-press self-start sm:self-auto">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Segarkan Data</span>
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <!-- Search Box -->
          <div class="flex items-center gap-2 flex-1 max-w-sm">
            <div class="relative w-full">
              <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="onSearch()"
                placeholder="Cari nama atau email pengguna..."
                class="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100">
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button (click)="onSearch()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
              Cari
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
          <span class="text-xs text-slate-400">Memuat data pengguna...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && users.length === 0" class="p-16 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            👥
          </div>
          <h3 class="text-sm font-bold text-slate-900">Tidak Ada Pengguna Ditemukan</h3>
          <p class="text-xs text-slate-400">Belum ada akun yang cocok dengan kata kunci pencarian.</p>
        </div>

        <!-- Users Table -->
        <div *ngIf="!isLoading && users.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" class="px-6 py-3.5">Pengguna & Akun</th>
                <th scope="col" class="px-6 py-3.5">Kontak</th>
                <th scope="col" class="px-6 py-3.5">Alamat Domisili</th>
                <th scope="col" class="px-6 py-3.5">Hak Akses Role</th>
                <th scope="col" class="px-6 py-3.5">Terdaftar Sejak</th>
                <th scope="col" class="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of users" class="hover:bg-slate-50/60 transition-colors">
                <!-- User Profile & Avatar -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {{ u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-xs">{{ u.fullName || 'Belum diatur' }}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5 font-mono">{{ u.email }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contact -->
                <td class="px-6 py-4 whitespace-nowrap text-slate-700">
                  {{ u.phone || '-' }}
                </td>

                <!-- Address -->
                <td class="px-6 py-4 text-slate-500 max-w-[200px] truncate" [title]="u.address || '-'">
                  {{ u.address || '-' }}
                </td>

                <!-- Roles -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let r of u.roles"
                      [ngClass]="r.includes('ADMIN') ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200'"
                      class="px-2 py-0.5 rounded-full text-[10px] border">
                      {{ r }}
                    </span>
                  </div>
                </td>

                <!-- Joined At -->
                <td class="px-6 py-4 whitespace-nowrap text-[11px] text-slate-400">
                  {{ u.createdAt | date:'dd MMM yyyy, HH:mm' }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                  <button (click)="openDetailModal(u)" class="text-indigo-600 hover:text-indigo-900 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                    Detail
                  </button>
                  <button *ngIf="!isSelf(u)" (click)="deleteUser(u)" class="text-rose-600 hover:text-rose-900 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors">
                    Nonaktifkan
                  </button>
                  <span *ngIf="isSelf(u)" class="text-[10px] text-slate-400 font-normal italic">
                    (Akun Anda)
                  </span>
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
            dari total <span class="font-bold text-slate-900">{{ pageData.totalElements }}</span> pengguna
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

    <!-- User Detail Modal -->
    <div *ngIf="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">Rincian Informasi Pengguna</h3>
          <button (click)="closeDetailModal()" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div class="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base">
              {{ selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">{{ selectedUser.fullName || 'Belum diatur' }}</h4>
              <p class="text-slate-400 font-mono text-[11px]">{{ selectedUser.email }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span class="text-[10px] text-slate-400 block font-semibold">ID PENGGUNA</span>
              <span class="font-mono text-[11px] text-slate-700 block truncate" [title]="selectedUser.id">{{ selectedUser.id }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block font-semibold">ROLE</span>
              <span class="font-bold text-indigo-700">{{ selectedUser.roles.join(', ') }}</span>
            </div>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">NOMOR TELEPON</span>
            <span class="text-slate-800">{{ selectedUser.phone || 'Belum dilengkapi' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">ALAMAT DOMISILI</span>
            <span class="text-slate-800">{{ selectedUser.address || 'Belum dilengkapi' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">WAKTU PENDAFTARAN</span>
            <span class="text-slate-800">{{ selectedUser.createdAt | date:'dd MMMM yyyy, HH:mm:ss' }}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button (click)="closeDetailModal()" class="px-5 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private tokenService = inject(TokenService);

  users: UserResponse[] = [];
  pageData: PageResponse<UserResponse> | null = null;
  isLoading = false;

  currentPage = 0;
  pageSize = 10;
  searchKeyword = '';

  selectedUser: UserResponse | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsersAdmin(this.currentPage, this.pageSize, this.searchKeyword)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.pageData = res.data;
            this.users = res.data.content;
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Pengguna', 'Gagal memuat daftar pengguna');
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page >= 0 && (!this.pageData || page < this.pageData.totalPages)) {
      this.currentPage = page;
      this.loadUsers();
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

  openDetailModal(u: UserResponse): void {
    this.selectedUser = u;
  }

  closeDetailModal(): void {
    this.selectedUser = null;
  }

  isSelf(u: UserResponse): boolean {
    const currentUser = this.tokenService.getUserInfo();
    return !!currentUser && currentUser.email === u.email;
  }

  deleteUser(u: UserResponse): void {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan akun ${u.fullName || u.email}? Pengguna tidak akan dapat login lagi.`)) return;

    this.userService.deleteUser(u.id).subscribe({
      next: () => {
        this.toastService.success('Berhasil', `Akun ${u.email} berhasil dinonaktifkan`);
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error('Gagal', err.error?.message || 'Gagal menonaktifkan akun pengguna');
      }
    });
  }
}
