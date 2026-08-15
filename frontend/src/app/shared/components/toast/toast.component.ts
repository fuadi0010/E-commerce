import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div *ngFor="let toast of toastService.toasts()" 
           class="flex items-start p-4 mb-2 text-gray-900 bg-white rounded-lg shadow-lg border-l-4 w-80 animate-fade-in-down"
           [ngClass]="getBorderColor(toast.type)"
           role="alert">
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg" [ngClass]="getIconColors(toast.type)">
          <!-- Ikon SVG berdasarkan tipe -->
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          <svg *ngIf="toast.type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        </div>
        <div class="ml-3 text-sm font-normal">
          <span class="block mb-1 text-sm font-semibold text-gray-900">{{ toast.title }}</span>
          <div class="mb-2 text-sm font-normal">{{ toast.message }}</div>
        </div>
        <button type="button" (click)="close(toast.id)" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8">
          <span class="sr-only">Close</span>
          <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInDown {
      from { opacity: 0; transform: translate3d(0, -20px, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getBorderColor(type: ToastType): string {
    switch(type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
    }
  }

  getIconColors(type: ToastType): string {
    switch(type) {
      case 'success': return 'text-green-500 bg-green-100';
      case 'error': return 'text-red-500 bg-red-100';
      case 'warning': return 'text-orange-500 bg-orange-100';
      case 'info': return 'text-blue-500 bg-blue-100';
    }
  }

  close(id: number): void {
    this.toastService.remove(id);
  }
}
