import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Add this new method for FormData posts
  postFormData<T>(url: string, formData: FormData): Observable<T> {
    const headers = this.getHeaders();
    // Note: We don't set Content-Type header - browser will set it automatically with boundary
    return this.http.post<T>(url, formData, { headers });
  }

  // Basic CRUD methods
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url, { headers: this.getHeaders() });
  }

  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(url, data, { headers: this.getHeaders() });
  }

  put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(url, data, { headers: this.getHeaders() });
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url, { headers: this.getHeaders() });
  }

  // ... rest of your existing methods remain unchanged ...
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`, { headers: this.getHeaders() });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  getCart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cart`, { headers: this.getHeaders() });
  }

  addToCart(data: { productId: string; quantity: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cart`, data, { headers: this.getHeaders() });
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cart/${productId}`, { headers: this.getHeaders() });
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wishlist`, { productId }, { headers: this.getHeaders() });
  }

  getVendorStore(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendors/${id}`, { headers: this.getHeaders() });
  }

  createVendorStore(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vendors`, data, { headers: this.getHeaders() });
  }

  updateVendorStore(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vendors/${id}`, data, { headers: this.getHeaders() });
  }

  getVendorDashboard(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendors/${id}/dashboard`, { headers: this.getHeaders() });
  }

  addProduct(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products`, data, { headers: this.getHeaders() });
  }




  // Admin-specific methods
  getAllVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vendors`, { headers: this.getHeaders() });
  }

  approveVendor(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vendors/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectVendor(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vendors/${id}/reject`, {}, { headers: this.getHeaders() });
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`, { headers: this.getHeaders() });
  }

  approveProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}/reject`, {}, { headers: this.getHeaders() });
  }


}