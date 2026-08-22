import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'e_commerce_cart';
  
  // Use signal to store cart items for reactivity
  private cartItemsSignal = signal<CartItem[]>(this.loadCart());

  // Expose readonly signals
  public cartItems = this.cartItemsSignal.asReadonly();
  
  public cartTotalCount = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0);
  });

  public cartTotalPrice = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + (item.product.price * item.quantity), 0);
  });

  constructor() {}

  private loadCart(): CartItem[] {
    const savedCart = localStorage.getItem(this.CART_KEY);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error('Failed to parse cart from local storage', e);
        return [];
      }
    }
    return [];
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this.cartItemsSignal.set(items);
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = [...this.cartItemsSignal()];
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex > -1) {
      // Update existing item
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      currentItems.push({ product, quantity });
    }

    this.saveCart(currentItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = [...this.cartItemsSignal()];
    const existingItemIndex = currentItems.findIndex(item => item.product.id === productId);

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].quantity = quantity;
      this.saveCart(currentItems);
    }
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSignal().filter(item => item.product.id !== productId);
    this.saveCart(currentItems);
  }

  clearCart(): void {
    this.saveCart([]);
  }
}
