import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 sm:top-24 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-sm sm:w-full z-[100] flex flex-col gap-2.5 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()" 
           class="pointer-events-auto flex items-start p-4 text-slate-900 bg-white/95 backdrop-blur-xl rounded-2xl shadow-ambient-lg border border-slate-200/80 transition-all transform animate-toast-slide"
           role="alert">
        
        <!-- Status Icon Container -->
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-xl mr-3" [ngClass]="getIconColors(toast.type)">
          <!-- Success -->
          <svg *ngIf="toast.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
          <!-- Error -->
          <svg *ngIf="toast.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <!-- Warning -->
          <svg *ngIf="toast.type === 'warning'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <!-- Info -->
          <svg *ngIf="toast.type === 'info'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pr-2">
          <h4 class="text-xs font-bold text-slate-900 leading-snug">{{ toast.title }}</h4>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ toast.message }}</p>
        </div>

        <!-- Close Button -->
        <button type="button" (click)="close(toast.id)" 
          class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

      </div>
    </div>
  `,
  styles: [`
    @keyframes toastSlide {
      from { opacity: 0; transform: translateY(-12px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-toast-slide { animation: toastSlide 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIconColors(type: ToastType): string {
    switch(type) {
      case 'success': return 'text-emerald-700 bg-emerald-50 border border-emerald-200/60';
      case 'error': return 'text-rose-700 bg-rose-50 border border-rose-200/60';
      case 'warning': return 'text-amber-700 bg-amber-50 border border-amber-200/60';
      case 'info': return 'text-indigo-700 bg-indigo-50 border border-indigo-200/60';
    }
  }

  close(id: number): void {
    this.toastService.remove(id);
  }
}
