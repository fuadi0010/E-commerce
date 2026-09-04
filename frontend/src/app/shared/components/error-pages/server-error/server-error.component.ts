import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none"></div>

      <div class="text-center relative z-10 max-w-md w-full p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-ambient-lg space-y-6">
        <div class="space-y-2">
          <span class="text-7xl sm:text-8xl font-black text-slate-900 tracking-tighter block">500</span>
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Gangguan Server</h1>
          <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Terjadi kendala teknis internal pada layanan kami. Tim kami sedang melakukan penanganan. Silakan muat ulang halaman beberapa saat lagi.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button (click)="reload()" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all btn-press">
            Muat Ulang Halaman
          </button>
          <a routerLink="/catalog" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors btn-press">
            Buka Katalog
          </a>
        </div>
      </div>
    </div>
  `
})
export class ServerErrorComponent {
  reload() {
    window.location.reload();
  }
}
