import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <!-- Back Button -->
      <a routerLink="/catalog" class="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-8 transition-colors">
        <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Catalog
      </a>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Error / Not Found State -->
      <div *ngIf="!isLoading && !product" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p class="text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
      </div>

      <!-- Product Content -->
      <div *ngIf="!isLoading && product" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="lg:grid lg:grid-cols-2 lg:gap-x-8">
          
          <!-- Product Image Area -->
          <div class="aspect-w-1 aspect-h-1 bg-gray-100 sm:rounded-l-2xl overflow-hidden flex items-center justify-center p-12 relative min-h-[400px]">
            <svg class="h-32 w-32 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div *ngIf="product.stock === 0" class="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span class="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg transform -rotate-12">OUT OF STOCK</span>
            </div>
          </div>

          <!-- Product Info Area -->
          <div class="p-8 lg:p-12 flex flex-col justify-center">
            
            <div class="flex items-center gap-2 mb-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {{ product.category?.name || 'Uncategorized' }}
              </span>
              <span *ngIf="product.stock > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock ({{ product.stock }})
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">{{ product.name }}</h1>
            
            <p class="text-4xl font-black text-indigo-600 mb-8">\${{ product.price }}</p>

            <div class="prose prose-sm sm:prose text-gray-500 mb-10">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p class="leading-relaxed">{{ product.description }}</p>
            </div>

            <div class="mt-auto">
              <button [disabled]="product.stock === 0" (click)="addToCart()"
                class="w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Add to Cart
              </button>
              <p *ngIf="product.stock === 0" class="mt-3 text-center text-sm text-red-500 font-medium">This product is currently out of stock.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private cartService = inject(CartService);

  product: Product | null = null;
  isLoading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (response) => {
        if (response.data) {
          this.product = response.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Error', 'Product not found');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  addToCart() {
    if (this.product && this.product.stock > 0) {
      this.cartService.addToCart(this.product, 1);
      this.toastService.success('Added to Cart', `${this.product.name} has been added to your cart.`);
    }
  }
}
