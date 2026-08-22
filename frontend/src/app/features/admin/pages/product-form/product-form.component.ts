import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/product.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">{{ isEditMode ? 'Edit Product' : 'Create New Product' }}</h2>
      </div>

      <div class="p-6">
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            <div class="sm:col-span-6">
              <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
              <div class="mt-1">
                <input type="text" id="name" formControlName="name" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
              </div>
            </div>

            <div class="sm:col-span-6">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1">
                <textarea id="description" formControlName="description" rows="3" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"></textarea>
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="price" class="block text-sm font-medium text-gray-700">Price ($)</label>
              <div class="mt-1">
                <input type="number" id="price" formControlName="price" min="0" step="0.01" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="stock" class="block text-sm font-medium text-gray-700">Stock</label>
              <div class="mt-1">
                <input type="number" id="stock" formControlName="stock" min="0" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="categoryId" class="block text-sm font-medium text-gray-700">Category</label>
              <div class="mt-1">
                <select id="categoryId" formControlName="categoryId" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                  <option value="" disabled>Select a category</option>
                  <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
                </select>
              </div>
            </div>

            <div class="sm:col-span-6">
              <label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL</label>
              <div class="mt-1">
                <input type="text" id="imageUrl" formControlName="imageUrl" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" placeholder="https://example.com/image.jpg">
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-end space-x-3">
            <a routerLink="/admin/products" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </a>
            <button type="submit" [disabled]="productForm.invalid || isLoading"
              class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditMode ? 'Update Product' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  isEditMode = false;
  productId: string | null = null;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = id;
        this.loadProduct(id);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(response => {
      if (response.data) {
        this.categories = response.data;
      }
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.data) {
          const product = response.data;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.category.id,
            imageUrl: product.imageUrl || ''
          });
        }
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load product');
        this.router.navigate(['/admin/products']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isLoading = true;
    const request = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, request).subscribe({
        next: () => {
          this.toastService.success('Success', 'Product updated successfully');
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.toastService.error('Error', 'Failed to update product');
          this.isLoading = false;
        },
        complete: () => this.isLoading = false
      });
    } else {
      this.productService.createProduct(request).subscribe({
        next: () => {
          this.toastService.success('Success', 'Product created successfully');
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.toastService.error('Error', 'Failed to create product');
          this.isLoading = false;
        },
        complete: () => this.isLoading = false
      });
    }
  }
}
