import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-slate-50/70 font-sans flex flex-col relative selection:bg-indigo-500 selection:text-white">
      
      <!-- Ambient light effect -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-100/40 via-purple-50/20 to-transparent blur-3xl opacity-60"></div>
      </div>

      <!-- Floating Navbar -->
      <app-navbar class="relative z-40"></app-navbar>
      
      <!-- Main Content Outlet -->
      <main class="flex-grow w-full relative z-10 pt-2 pb-16">
        <router-outlet></router-outlet>
      </main>

      <!-- Trust Badges & Footer -->
      <footer class="bg-white border-t border-slate-200/80 relative z-10">
        
        <!-- Trust Propositions -->
        <div class="border-b border-slate-100 py-10 bg-slate-50/50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div class="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Garansi Orisinal 100%</h4>
                  <p class="text-[11px] text-slate-500">Semua produk terverifikasi resmi</p>
                </div>
              </div>

              <div class="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Pengiriman Cepat</h4>
                  <p class="text-[11px] text-slate-500">Ekspedisi aman ke seluruh Indonesia</p>
                </div>
              </div>

              <div class="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Pembayaran Terenkripsi</h4>
                  <p class="text-[11px] text-slate-500">Transaksi terlindungi standar tinggi</p>
                </div>
              </div>

              <div class="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Dukungan Responsif</h4>
                  <p class="text-[11px] text-slate-500">Tim siap membantu kendala Anda</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Footer Main Links -->
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <!-- Col 1: Brand Info -->
            <div class="space-y-3 md:col-span-2">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center p-1.5 shadow-sm">
                  <svg viewBox="0 0 36 36" fill="none" class="w-full h-full">
                    <path d="M12 11V8C12 4.686 14.686 2 18 2C21.314 2 24 4.686 24 8V11" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
                    <rect x="5" y="10" width="26" height="22" rx="5" fill="white" fill-opacity="0.2" />
                    <path d="M12 16C12 19.314 14.686 22 18 22C21.314 22 24 19.314 24 16" stroke="white" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
                    <path d="M26 6L27.2 9.8L31 11L27.2 12.2L26 16L24.8 12.2L21 11L24.8 9.8L26 6Z" fill="#F59E0B" />
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="font-extrabold text-base tracking-tight text-slate-900">AURA</span>
                  <span class="text-[10px] tracking-widest text-slate-500 uppercase font-semibold -mt-1">Borkat Serba Ada</span>
                </div>
              </div>
              <p class="text-xs text-slate-500 max-w-sm leading-relaxed">
                Platform e-commerce generasi berikutnya yang dirancang untuk pengalaman belanja digital yang mulus, aman, dan memuaskan.
              </p>
            </div>

            <!-- Col 2: Navigasi -->
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Navigasi</h4>
              <ul class="space-y-2 text-xs text-slate-600">
                <li><a routerLink="/catalog" class="hover:text-indigo-600 transition-colors">Katalog Produk</a></li>
                <li><a routerLink="/cart" class="hover:text-indigo-600 transition-colors">Keranjang Belanja</a></li>
                <li><a routerLink="/orders" class="hover:text-indigo-600 transition-colors">Riwayat Pesanan</a></li>
              </ul>
            </div>

            <!-- Col 3: Akun & Bantuan -->
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Akun & Layanan</h4>
              <ul class="space-y-2 text-xs text-slate-600">
                <li><a routerLink="/login" class="hover:text-indigo-600 transition-colors">Masuk Akun</a></li>
                <li><a routerLink="/register" class="hover:text-indigo-600 transition-colors">Daftar Member</a></li>
                <li><a routerLink="/profile" class="hover:text-indigo-600 transition-colors">Pengaturan Profil</a></li>
              </ul>
            </div>

          </div>

          <div class="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-slate-400">
              &copy; 2026 Borkat Serba Ada. Hak Cipta Dilindungi.
            </p>
            <div class="flex items-center gap-4 text-xs text-slate-400">
              <span class="hover:text-slate-600 cursor-pointer">Privasi</span>
              <span>&bull;</span>
              <span class="hover:text-slate-600 cursor-pointer">Syarat & Ketentuan</span>
              <span>&bull;</span>
              <span class="hover:text-slate-600 cursor-pointer">Keamanan</span>
            </div>
          </div>
        </div>

      </footer>
    </div>
  `
})
export class PublicLayoutComponent {
}
