import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { MidtransConfig, MidtransSnapResult, PaymentResponse } from '../models/payment.model';

/**
 * Service untuk integrasi Midtrans Payment Gateway.
 *
 * Tanggung jawab:
 * 1. Fetch konfigurasi publik Midtrans (clientKey + snapUrl) — hanya sekali.
 * 2. Membuat atau mengambil transaksi pembayaran per order.
 * 3. Memuat Snap.js secara dinamis ke DOM (idempotent).
 * 4. Membuka Midtrans Snap popup dengan token yang diberikan.
 *
 * KEAMANAN: Server Key TIDAK pernah dikirim ke frontend.
 * Client Key diambil dari backend via /api/payments/midtrans/config.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** Cache konfigurasi publik Midtrans agar tidak di-fetch berulang. */
  private _config: MidtransConfig | null = null;

  /** Lacak apakah snap.js sudah dimuat ke DOM. */
  private _snapScriptLoaded = false;

  /** Promise in-flight untuk mencegah multiple concurrent load. */
  private _snapLoadPromise: Promise<void> | null = null;

  // ─────────────────────────────────────────────
  // API Calls
  // ─────────────────────────────────────────────

  /**
   * Mengambil konfigurasi publik Midtrans (clientKey & snapUrl).
   * Aman untuk dipanggil dari frontend karena tidak mengandung server key.
   */
  getMidtransConfig(): Observable<ApiResponse<MidtransConfig>> {
    return this.http.get<ApiResponse<MidtransConfig>>(`${this.apiUrl}/payments/midtrans/config`);
  }

  /**
   * Membuat atau mengambil transaksi pembayaran Midtrans untuk sebuah order.
   * Backend bersifat idempotent — jika token sudah ada & belum expire, dikembalikan kembali.
   *
   * @param orderId UUID order yang akan dibayar
   */
  createPayment(orderId: string): Observable<ApiResponse<PaymentResponse>> {
    return this.http.post<ApiResponse<PaymentResponse>>(
      `${this.apiUrl}/orders/${orderId}/payment`,
      {}
    );
  }

  /**
   * Mengambil status pembayaran terbaru untuk sebuah order.
   *
   * @param orderId UUID order
   */
  getPayment(orderId: string): Observable<ApiResponse<PaymentResponse>> {
    return this.http.get<ApiResponse<PaymentResponse>>(
      `${this.apiUrl}/orders/${orderId}/payment`
    );
  }

  // ─────────────────────────────────────────────
  // Snap.js Dynamic Script Loader
  // ─────────────────────────────────────────────

  /**
   * Memuat snap.js dari Midtrans secara dinamis ke DOM.
   * Idempotent: jika script sudah dimuat sebelumnya, langsung resolve.
   *
   * @param snapUrl URL script snap.js (dari getMidtransConfig)
   * @param clientKey Client key Midtrans untuk atribut data-client-key
   */
  loadSnapScript(snapUrl: string, clientKey: string): Promise<void> {
    // Jika sudah dimuat, langsung resolve
    if (this._snapScriptLoaded && window.snap) {
      return Promise.resolve();
    }

    // Jika sedang dimuat (concurrent call), tunggu promise yang sama
    if (this._snapLoadPromise) {
      return this._snapLoadPromise;
    }

    // Cek apakah script tag sudah ada di DOM (misal dari SSR atau reload)
    const existingScript = document.querySelector(`script[src*="snap.js"]`);
    if (existingScript && window.snap) {
      this._snapScriptLoaded = true;
      return Promise.resolve();
    }

    this._snapLoadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = snapUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;

      script.onload = () => {
        this._snapScriptLoaded = true;
        this._snapLoadPromise = null;
        resolve();
      };

      script.onerror = () => {
        this._snapLoadPromise = null;
        reject(new Error(`Gagal memuat Midtrans Snap.js dari: ${snapUrl}`));
      };

      document.head.appendChild(script);
    });

    return this._snapLoadPromise;
  }

  // ─────────────────────────────────────────────
  // Snap Popup
  // ─────────────────────────────────────────────

  /**
   * Membuka Midtrans Snap payment popup.
   * Harus dipanggil SETELAH loadSnapScript() selesai.
   *
   * @param snapToken Token transaksi Snap dari backend
   * @param callbacks Callback onSuccess, onPending, onError, onClose
   */
  openSnapPopup(
    snapToken: string,
    callbacks: {
      onSuccess?: (result: MidtransSnapResult) => void;
      onPending?: (result: MidtransSnapResult) => void;
      onError?: (result: MidtransSnapResult) => void;
      onClose?: () => void;
    }
  ): void {
    if (!window.snap) {
      throw new Error('Midtrans Snap belum dimuat. Panggil loadSnapScript() terlebih dahulu.');
    }
    window.snap.pay(snapToken, callbacks);
  }

  // ─────────────────────────────────────────────
  // Orchestration Helper
  // ─────────────────────────────────────────────

  /**
   * Helper lengkap: fetch config → load snap.js → buka popup.
   * Mengabstraksi seluruh flow agar component tidak perlu tahu detail teknisnya.
   *
   * @param snapToken Token Snap dari createPayment()
   * @param callbacks Callback handlers untuk popup
   */
  async initAndOpenSnap(
    snapToken: string,
    callbacks: {
      onSuccess?: (result: MidtransSnapResult) => void;
      onPending?: (result: MidtransSnapResult) => void;
      onError?: (result: MidtransSnapResult) => void;
      onClose?: () => void;
    }
  ): Promise<void> {
    // Ambil config jika belum di-cache
    if (!this._config) {
      const configRes = await firstValueFrom(this.getMidtransConfig());
      this._config = configRes.data!;
    }

    // Muat snap.js (idempotent)
    await this.loadSnapScript(this._config.snapUrl, this._config.clientKey);

    // Buka popup
    this.openSnapPopup(snapToken, callbacks);
  }
}
