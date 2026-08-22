import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product, Category, ProductSearchRequest, PageResponse } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Header & Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Explore Products</h1>
        <div class="relative w-full md:w-96">
          <input type="text" [(ngModel)]="searchParams.name" (keyup.enter)="onSearch()"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search products...">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Sidebar Filters -->
        <div class="w-full lg:w-64 flex-shrink-0 space-y-6">
          <!-- Sort -->
          <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-3">Sort By</h3>
            <select [(ngModel)]="searchParams.sortBy" (change)="onSearch()"
              class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>

          <!-- Price Range -->
          <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-3">Price Range</h3>
            <div class="flex items-center gap-2">
              <input type="number" [(ngModel)]="searchParams.minPrice" placeholder="Min" class="w-full border-gray-300 rounded-md shadow-sm text-sm p-2">
              <span class="text-gray-500">-</span>
              <input type="number" [(ngModel)]="searchParams.maxPrice" placeholder="Max" class="w-full border-gray-300 rounded-md shadow-sm text-sm p-2">
            </div>
            <button (click)="onSearch()" class="mt-3 w-full bg-indigo-50 text-indigo-700 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
              Apply Filter
            </button>
          </div>

          <!-- Categories -->
          <!-- Note: Kita biarkan form kategori ada, walau opsional -->
        </div>

        <!-- Product Grid -->
        <div class="flex-grow">
          
          <div *ngIf="isLoading" class="flex justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div *ngIf="!isLoading && products.length === 0" class="bg-white p-10 text-center rounded-lg shadow-sm border border-gray-100">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">No products found</h3>
            <p class="text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
            <button (click)="resetFilters()" class="mt-4 text-indigo-600 font-medium hover:text-indigo-800">Clear all filters</button>
          </div>

          <div *ngIf="!isLoading && products.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Product Card -->
              <div *ngFor="let product of products" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div class="h-48 bg-gray-200 flex items-center justify-center relative">
                   <!-- Placeholder Image -->
                  <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span *ngIf="product.stock === 0" class="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Out of Stock</span>
                </div>
                <div class="p-5 flex-grow flex flex-col">
                  <div class="text-xs text-indigo-600 font-medium mb-1">{{ product.category?.name || 'Uncategorized' }}</div>
                  <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                    <a [routerLink]="['/product', product.slug]" class="hover:text-indigo-600">{{ product.name }}</a>
                  </h3>
                  <p class="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{{ product.description }}</p>
                  <div class="flex items-center justify-between mt-auto">
                    <span class="text-xl font-extrabold text-gray-900">\${{ product.price }}</span>
                    <a [routerLink]="['/product', product.slug]" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">View Details</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div *ngIf="pageData && pageData.totalPages > 1" class="mt-10 flex justify-center">
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button (click)="changePage(searchParams.page! - 1)" [disabled]="searchParams.page === 0"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {{ searchParams.page! + 1 }} of {{ pageData.totalPages }}
                </span>
                <button (click)="changePage(searchParams.page! + 1)" [disabled]="pageData.last"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  products: Product[] = [];
  pageData: PageResponse<Product> | null = null;
  isLoading = false;

  searchParams: ProductSearchRequest = {
    page: 0,
    size: 9,
    sortBy: 'newest'
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.searchProducts(this.searchParams).subscribe({
      next: (response) => {
        if (response.data) {
          this.pageData = response.data;
          this.products = response.data.content;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Error', 'Failed to load products');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.searchParams.page = 0; // Reset ke halaman pertama saat mencari
    this.loadProducts();
  }

  resetFilters() {
    this.searchParams = {
      page: 0,
      size: 9,
      sortBy: 'newest'
    };
    this.loadProducts();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && (!this.pageData || newPage < this.pageData.totalPages)) {
      this.searchParams.page = newPage;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
