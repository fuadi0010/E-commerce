import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="w-64 bg-indigo-900 text-white flex flex-col">
        <div class="p-6 border-b border-indigo-800">
          <h2 class="text-2xl font-black tracking-wider text-white">ADMIN<span class="text-indigo-400">PANEL</span></h2>
        </div>
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-3">
            <li>
              <a routerLink="/admin/dashboard" routerLinkActive="bg-indigo-800 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/admin/categories" routerLinkActive="bg-indigo-800 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                Categories
              </a>
            </li>
            <li>
              <a routerLink="/admin/products" routerLinkActive="bg-indigo-800 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Products
              </a>
            </li>
          </ul>
        </nav>
        <div class="p-4 border-t border-indigo-800">
          <a routerLink="/" class="flex items-center text-sm font-medium text-indigo-200 hover:text-white transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Store
          </a>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top header -->
        <header class="bg-white shadow-sm z-10">
          <div class="px-6 py-4 flex justify-between items-center">
            <h1 class="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 font-medium">Admin User</span>
              <div class="ml-3 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">A</div>
            </div>
          </div>
        </header>

        <!-- Main section -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {

}
