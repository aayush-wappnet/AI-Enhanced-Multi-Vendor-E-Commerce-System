import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = `${environment.apiUrl}`;
  cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

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
    return this.http.delete<T>(url, { headers: this.getHeaders() }).pipe(
      switchMap(() => this.getCart())
    );
  }

  // Specific methods
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`, { headers: this.getHeaders() });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  getCart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cart`, { headers: this.getHeaders() }).pipe(
      tap(cart => this.cartCountSubject.next(cart.items?.length || 0))
    );
  }

  addToCart(data: { productId: string | number; quantity: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cart`, data, { headers: this.getHeaders() }).pipe(
      switchMap(() => this.getCart())
    );
  }

  removeFromCart(cartItemId: string | number): Observable<any> {
    return this.delete(`${this.apiUrl}/cart/item/${cartItemId}`);
  }

  addToWishlist(productId: string | number): Observable<any> {
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

  getPendingVendorsCount(): Observable<number> {
    return this.get<number>(`${this.apiUrl}/vendors/pending/count`);
  }

  getApprovedVendorsCount(): Observable<number> {
    return this.get<number>(`${this.apiUrl}/vendors/approved/count`);
  }

  getRejectedVendorsCount(): Observable<number> {
    return this.get<number>(`${this.apiUrl}/vendors/rejected/count`);
  }

  approveVendor(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vendors/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectVendor(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vendors/${id}/reject`, {}, { headers: this.getHeaders() });
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/all`, { headers: this.getHeaders() });
  }

  getApprovedProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/approved`, { headers: this.getHeaders() });
  }

  getRejectedProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/rejected`, { headers: this.getHeaders() });
  }

  approveProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}/reject`, {}, { headers: this.getHeaders() });
  }

  // Order management methods
  getAllOrders(): Observable<any[]> {
    return this.get<any[]>(`${this.apiUrl}/orders/all-orders`);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.put<any>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  // New method for canceling order
  cancelOrder(id: number): Observable<any> {
    return this.put<any>(`${this.apiUrl}/orders/${id}/cancel`, {}).pipe(
      switchMap(() => this.getOrders()) // Refresh orders after cancellation
    );
  }

  // Sales-related methods
  getTotalProductsSold(): Observable<number> {
    return this.get<number>(`${this.apiUrl}/orders/sales/total-products-sold`);
  }

  getTotalSales(): Observable<number> {
    return this.get<number>(`${this.apiUrl}/orders/sales/total-sales`);
  }

  getMostSoldProduct(): Observable<any> {
    return this.get<any>(`${this.apiUrl}/orders/sales/most-sold-product`);
  }

  getTotalOrders(): Observable<number> {
    return this.get<number>(`${this.apiUrl}/orders/sales/total-orders`);
  }

  getRevenueByStatus(): Observable<any[]> {
    return this.get<any[]>(`${this.apiUrl}/orders/sales/revenue-by-status`);
  }

  // Existing order methods
  getOrders(): Observable<any[]> {
    console.log('Fetching orders from API...');
    return this.get<any[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(id: number): Observable<any> {
    return this.get<any>(`${this.apiUrl}/orders/${id}`);
  }

  // New method for chatbot response
  getChatbotResponse(message: string): Observable<{ response: string }> {
    return this.post<{ response: string }>(`${this.apiUrl}/chatbot`, { message });
  }


  getRecommendations(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/${id}/recommendations`, { headers: this.getHeaders() });
  }

}