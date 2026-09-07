import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../../core/services/review.service';
import { ReviewResponse } from '../../../../core/models/review.model';
import { PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Back to Dashboard Navigation -->
      <a routerLink="/admin/dashboard" class="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span>Kembali ke Dashboard</span>
      </a>

      <!-- Quick Metrics Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-ambient flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            💬
          </div>
          <div>
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Ulasan</span>
            <span class="text-2xl font-black text-slate-900">{{ pageData?.totalElements || 0 }}</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-ambient flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ★
          </div>
          <div>
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Rata-rata Rating</span>
            <span class="text-2xl font-black text-slate-900">{{ calculateAverageRating() }} / 5.0</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-ambient flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ⭐
          </div>
          <div>
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Rating Sempurna (5★)</span>
            <span class="text-2xl font-black text-slate-900">{{ countFiveStarReviews() }} Ulasan</span>
          </div>
        </div>
      </div>

      <!-- Main Reviews Card -->
      <div class="bg-white rounded-3xl shadow-ambient border border-slate-200/80 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Manajemen Ulasan Pelanggan</h2>
            <p class="text-xs text-slate-400 mt-0.5">Pantau ulasan kepuasan pembeli, rating bintang, dan feedback kualitas produk secara terpusat</p>
          </div>
          <button (click)="loadReviews()" class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all gap-2 btn-press self-start sm:self-auto">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Segarkan Data</span>
          </button>
        </div>

        <!-- Toolbar: Page Size Selector -->
        <div class="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span class="font-medium">Daftar ulasan yang terhubung langsung ke database PostgreSQL:</span>
          <div class="flex items-center gap-2 ml-auto">
            <span>Tampilkan per halaman:</span>
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
          <span class="text-xs text-slate-400">Memuat ulasan pelanggan...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && reviews.length === 0" class="p-16 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
            💬
          </div>
          <h3 class="text-sm font-bold text-slate-900">Belum Ada Ulasan Pelanggan</h3>
          <p class="text-xs text-slate-400">Saat ini belum ada pembeli yang memberikan ulasan produk di database.</p>
        </div>

        <!-- Reviews Table -->
        <div *ngIf="!isLoading && reviews.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead class="bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" class="px-6 py-3.5">Produk</th>
                <th scope="col" class="px-6 py-3.5">Pembeli</th>
                <th scope="col" class="px-6 py-3.5">Rating</th>
                <th scope="col" class="px-6 py-3.5">Ulasan</th>
                <th scope="col" class="px-6 py-3.5">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let rev of reviews" class="hover:bg-slate-50/60 transition-colors">
                <!-- Produk -->
                <td class="px-6 py-4 max-w-[220px]">
                  <div class="font-bold text-slate-900 truncate" [title]="rev.productName || 'Produk'">
                    {{ rev.productName || 'Produk ID: ' + (rev.productId | slice:0:8) + '...' }}
                  </div>
                  <a *ngIf="rev.productId" [routerLink]="['/product', rev.productId]" target="_blank"
                    class="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 mt-0.5 transition-colors">
                    <span>Lihat Halaman Produk</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </td>

                <!-- Pembeli / Reviewer -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                      {{ rev.userFullName ? rev.userFullName.charAt(0) : 'U' }}
                    </div>
                    <div class="text-xs font-semibold text-slate-800 truncate max-w-[160px]" [title]="rev.userFullName">
                      {{ rev.userFullName || 'Pelanggan' }}
                    </div>
                  </div>
                </td>

                <!-- Rating Stars -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60">
                    <span class="text-amber-500 font-bold">★</span>
                    <span class="font-black text-amber-900 text-xs">{{ rev.rating }}.0</span>
                  </div>
                </td>

                <!-- Komentar -->
                <td class="px-6 py-4 max-w-md">
                  <p class="text-xs text-slate-700 leading-relaxed line-clamp-3" [title]="rev.comment">
                    {{ rev.comment }}
                  </p>
                </td>

                <!-- Tanggal -->
                <td class="px-6 py-4 whitespace-nowrap text-slate-400 text-[11px] font-medium">
                  {{ rev.createdAt | date:'dd MMM yyyy, HH:mm' }}
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
            dari total <span class="font-bold text-slate-900">{{ pageData.totalElements }}</span> ulasan
          </div>

          <!-- Page Numbers List -->
          <div class="flex items-center gap-1">
            <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0"
              class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors text-xs">
              &larr; Prev
            </button>
            
            <button *ngFor="let p of getPagesArray()" (click)="changePage(p)"
              [ngClass]="p === currentPage ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'"
              class="w-7 h-7 rounded-xl text-xs transition-colors flex items-center justify-center font-semibold">
              {{ p + 1 }}
            </button>

            <button (click)="changePage(currentPage + 1)" [disabled]="pageData.last"
              class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors text-xs">
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReviewListComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private toastService = inject(ToastService);

  reviews: ReviewResponse[] = [];
  pageData: PageResponse<ReviewResponse> | null = null;
  isLoading = false;
  currentPage = 0;
  pageSize = 10;

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.reviewService.getAllReviewsAdmin(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.data) {
          this.pageData = res.data;
          this.reviews = res.data.content;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Error', 'Gagal memuat daftar ulasan pelanggan');
      }
    });
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadReviews();
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && (!this.pageData || newPage < this.pageData.totalPages)) {
      this.currentPage = newPage;
      this.loadReviews();
    }
  }

  getEndIndex(): number {
    if (!this.pageData) return 0;
    return Math.min((this.currentPage + 1) * this.pageSize, this.pageData.totalElements);
  }

  getPagesArray(): number[] {
    if (!this.pageData) return [];
    return Array.from({ length: this.pageData.totalPages }, (_, i) => i);
  }

  calculateAverageRating(): string {
    if (!this.reviews || this.reviews.length === 0) return '0.0';
    const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  countFiveStarReviews(): number {
    if (!this.reviews) return 0;
    return this.reviews.filter(r => r.rating === 5).length;
  }
}
