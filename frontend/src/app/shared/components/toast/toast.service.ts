import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastCounter = 0;
  
  // Menggunakan Angular 18 Signal untuk state management
  toasts = signal<ToastMessage[]>([]);

  constructor() {}

  show(type: ToastType, title: string, message: string): void {
    const id = ++this.toastCounter;
    const newToast: ToastMessage = { id, type, title, message };
    
    this.toasts.update(current => [...current, newToast]);

    // Auto remove setelah 5 detik
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message);
  }

  warning(title: string, message: string): void {
    this.show('warning', title, message);
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
