export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  quota: number;
  usedCount: number;
  isActive: boolean;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoucherRequest {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  quota: number;
  validUntil: string;
}

export interface UpdateVoucherRequest {
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  quota: number;
  validUntil: string;
  isActive?: boolean;
}

export interface ValidateVoucherRequest {
  code: string;
  orderAmount: number;
}

export interface VoucherCalculationResponse {
  valid: boolean;
  code: string;
  description?: string;
  discountAmount: number;
  finalAmount: number;
  message: string;
}
