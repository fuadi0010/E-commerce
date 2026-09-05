import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-slate-100/70 font-sans">
      
      <!-- Sleek Obsidian Sidebar -->
      <aside class="w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800">
        
        <!-- Sidebar Brand -->
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
            A
          </div>
          <div>
            <h2 class="text-sm font-extrabold tracking-tight text-white leading-none">AURA</h2>
            <span class="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Admin Console</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-indigo-600 text-white font-bold" 
            class="flex items-center gap-3 px-3.5 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            <span>Overview Dashboard</span>
          </a>

          <a routerLink="/admin/categories" routerLinkActive="bg-indigo-600 text-white font-bold" 
            class="flex items-center gap-3 px-3.5 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <span>Manajemen Kategori</span>
          </a>

          <a routerLink="/admin/products" routerLinkActive="bg-indigo-600 text-white font-bold" 
            class="flex items-center gap-3 px-3.5 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span>Manajemen Produk</span>
          </a>

          <a routerLink="/admin/orders" routerLinkActive="bg-indigo-600 text-white font-bold" 
            class="flex items-center gap-3 px-3.5 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>Manajemen Pesanan</span>
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-800">
          <a routerLink="/catalog" class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Kembali ke Toko</span>
          </a>
        </div>

      </aside>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col overflow-hidden">
        
        <!-- Header -->
        <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex justify-between items-center z-10">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="font-bold text-slate-900">Admin Control</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-700">Administrator</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 font-bold text-xs flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        <!-- Main Workspace -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8">
          <router-outlet></router-outlet>
        </main>

      </div>

    </div>
  `
})
export class AdminLayoutComponent {
}
