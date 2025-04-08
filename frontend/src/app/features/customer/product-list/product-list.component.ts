import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products$: Observable<any[]> = of([]);
  quantities: { [productId: string]: { cartItemId: number; present: boolean } } = {}; // Store cartItemId and presence

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.products$ = this.apiService.getProducts().pipe(
      tap(products => {
        // Initialize quantities based on cart contents
        this.apiService.getCart().subscribe({
          next: (cart) => {
            cart.items.forEach((item: { id: number; product: { id: string | number }; quantity: number }) => {
              this.quantities[item.product.id] = { cartItemId: item.id, present: true };
            });
          },
          error: (err) => console.error('Error fetching cart', err)
        });
      })
    );
  }

  addToCart(productId: string, event?: Event) {
    event?.stopPropagation(); // Prevent card click from triggering navigation

    if (this.quantities[productId] && this.quantities[productId].present) {
      // Remove from cart using cartItemId
      const cartItemId = this.quantities[productId].cartItemId;
      delete this.quantities[productId];
      this.apiService.delete(`${this.apiService.apiUrl}/cart/item/${cartItemId}`).pipe(
        switchMap(() => this.apiService.getCart())
      ).subscribe({
        next: (cart) => {
          // Update quantities based on the refreshed cart
          this.quantities = {};
          cart.items.forEach((item: { id: number; product: { id: string | number }; quantity: number }) => {
            this.quantities[item.product.id] = { cartItemId: item.id, present: true };
          });
          console.log('Removed from cart', productId);
        },
        error: (err) => console.error('Error removing from cart', err)
      });
    } else {
      // Add to cart with default quantity 1
      this.quantities[productId] = { cartItemId: -1, present: true }; // Temporary cartItemId, will be updated after add
      this.apiService.addToCart({ productId, quantity: 1 }).pipe(
        switchMap(() => this.apiService.getCart())
      ).subscribe({
        next: (cart) => {
          // Update quantities with the new cartItemId from the refreshed cart
          this.quantities = {};
          cart.items.forEach((item: { id: number; product: { id: string | number }; quantity: number }) => {
            this.quantities[item.product.id] = { cartItemId: item.id, present: true };
          });
          console.log('Added to cart', productId);
        },
        error: (err) => console.error('Error adding to cart', err)
      });
    }
  }

  viewProductDetails(productId: string) {
    this.router.navigate(['/', productId]);
  }
}