import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Create New Category</h2>
      </div>

      <div class="p-6">
        <form (ngSubmit)="onSubmit()" #categoryForm="ngForm">
          <div class="mb-6">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input type="text" id="name" name="name" [(ngModel)]="name" required
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              placeholder="e.g., Electronics, Clothing">
          </div>

          <div class="flex justify-end space-x-3">
            <a routerLink="/admin/categories" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </a>
            <button type="submit" [disabled]="!categoryForm.form.valid || isLoading"
              class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CategoryCreateComponent {
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  name: string = '';
  isLoading = false;

  onSubmit() {
    if (!this.name.trim()) {
      return;
    }
    
    this.isLoading = true;
    this.categoryService.createCategory({ name: this.name }).subscribe({
      next: () => {
        this.toastService.success('Success', 'Category created successfully');
        this.router.navigate(['/admin/categories']);
      },
      error: () => {
        this.toastService.error('Error', 'Failed to create category');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
