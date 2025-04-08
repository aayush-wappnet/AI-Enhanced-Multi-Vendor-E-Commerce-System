import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart$: Observable<any> = of({ items: [], total: 0 });

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cart$ = this.apiService.getCart();
  }

  incrementQuantity(cartItemId: number, currentQuantity: number, stock: number) {
    if (currentQuantity < stock) {
      const newQuantity = currentQuantity + 1;
      this.updateQuantity(cartItemId, newQuantity);
    } else {
      alert(`Cannot add more. Only ${stock} items are in stock.`);
    }
  }

  decrementQuantity(cartItemId: number, currentQuantity: number) {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      this.updateQuantity(cartItemId, newQuantity);
    }
  }

  updateQuantity(cartItemId: number, quantity: number) {
    this.apiService.put(`${this.apiService.apiUrl}/cart/item/${cartItemId}`, { quantity })
      .pipe(switchMap(() => this.apiService.getCart()))
      .subscribe(updatedCart => {
        this.cart$ = of(updatedCart); // Update the cart observable
      });
  }

  removeFromCart(cartItemId: number) {
    this.apiService.delete(`${this.apiService.apiUrl}/cart/item/${cartItemId}`)
      .pipe(switchMap(() => this.apiService.getCart()))
      .subscribe(updatedCart => {
        this.cart$ = of(updatedCart);
      });
  }

  checkout() {
    console.log('Checkout initiated');
    // Implement checkout logic when API is ready
  }

  calculateItemTotal(price: string, quantity: number): number {
    return parseFloat(price) * quantity;
  }

  calculateTotal(cart: any): number {
    return cart.items.reduce((sum: number, item: any) => sum + this.calculateItemTotal(item.product.price, item.quantity), 0);
  }
}