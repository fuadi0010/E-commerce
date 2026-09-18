/**
 * Status pembayaran Midtrans (sesuai backend PaymentStatus enum).
 */
export type PaymentStatus =
  | 'PENDING'
  | 'SETTLEMENT'
  | 'CAPTURE'
  | 'DENY'
  | 'CANCEL'
  | 'EXPIRE'
  | 'FAILURE'
  | 'REFUND';

/**
 * Respon pembayaran dari backend (cermin PaymentResponse.java).
 */
export interface PaymentResponse {
  id: string;
  orderId: string;
  transactionId: string | null;
  snapToken: string | null;
  redirectUrl: string | null;
  paymentType: string | null;
  grossAmount: number;
  currency: string;
  status: PaymentStatus;
  fraudStatus: string | null;
  expiryTime: string | null;
  paidAt: string | null;
  createdAt: string;
}

/**
 * Konfigurasi publik Midtrans dari backend (cermin MidtransConfigResponse.java).
 * Hanya berisi clientKey & snapUrl — TIDAK ADA server key.
 */
export interface MidtransConfig {
  clientKey: string;
  snapUrl: string;
  isProduction: boolean;
}

/**
 * Deklarasi global untuk Midtrans Snap SDK yang di-inject secara dinamis.
 */
declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        options?: {
          onSuccess?: (result: MidtransSnapResult) => void;
          onPending?: (result: MidtransSnapResult) => void;
          onError?: (result: MidtransSnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

/**
 * Hasil callback dari Midtrans Snap popup.
 */
export interface MidtransSnapResult {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  status_code?: string;
  status_message?: string;
}
