import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/product.model';
import {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  ValidateVoucherRequest,
  VoucherCalculationResponse
} from '../models/voucher.model';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vouchers`;

  getAllVouchersAdmin(
    page: number = 0,
    size: number = 10,
    search?: string,
    isActive?: boolean
  ): Observable<ApiResponse<PageResponse<Voucher>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    if (isActive !== undefined && isActive !== null) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<ApiResponse<PageResponse<Voucher>>>(this.apiUrl, { params });
  }

  getActiveVouchers(): Observable<ApiResponse<Voucher[]>> {
    return this.http.get<ApiResponse<Voucher[]>>(`${this.apiUrl}/active`);
  }

  getVoucherById(id: string): Observable<ApiResponse<Voucher>> {
    return this.http.get<ApiResponse<Voucher>>(`${this.apiUrl}/${id}`);
  }

  createVoucher(request: CreateVoucherRequest): Observable<ApiResponse<Voucher>> {
    return this.http.post<ApiResponse<Voucher>>(this.apiUrl, request);
  }

  updateVoucher(id: string, request: UpdateVoucherRequest): Observable<ApiResponse<Voucher>> {
    return this.http.put<ApiResponse<Voucher>>(`${this.apiUrl}/${id}`, request);
  }

  toggleVoucherStatus(id: string): Observable<ApiResponse<Voucher>> {
    return this.http.patch<ApiResponse<Voucher>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  deleteVoucher(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  validateVoucher(code: string, orderAmount: number): Observable<ApiResponse<VoucherCalculationResponse>> {
    const request: ValidateVoucherRequest = { code, orderAmount };
    return this.http.post<ApiResponse<VoucherCalculationResponse>>(`${this.apiUrl}/validate`, request);
  }
}
