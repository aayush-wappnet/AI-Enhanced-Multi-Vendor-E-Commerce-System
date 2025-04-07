import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products$: Observable<any[]> = of([]);
  quantities: { [key: string]: number } = {};

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.products$ = this.apiService.getProducts().pipe(
      tap(products => {
        // Optionally initialize quantities from cart (if your API supports it)
        this.apiService.getCart().subscribe({
          next: (cart) => {
            cart.forEach((item: { productId: string | number; quantity: number; }) => {
              this.quantities[item.productId] = item.quantity;
            });
          },
          error: (err) => console.error('Error fetching cart', err)
        });
      })
    );
  }

  addToCart(productId: string, delta: number = 0, event?: Event) {
    event?.stopPropagation(); // Prevent card click from triggering navigation

    // Get current quantity or default to 0
    const currentQuantity = this.quantities[productId] || 0;
    
    // Calculate new quantity
    let newQuantity: number;
    if (!currentQuantity && delta === 0) {
      newQuantity = 1; // Initial add sets quantity to 1
    } else {
      newQuantity = currentQuantity + (delta || 1); // Increment by delta or 1 if no delta
    }

    // Handle removal case
    if (newQuantity <= 0) {
      delete this.quantities[productId];
      this.apiService.removeFromCart(productId).subscribe({
        next: () => console.log('Removed from cart', productId),
        error: (err) => console.error('Error removing from cart', err)
      });
      return;
    }

    // Update local quantity
    this.quantities[productId] = newQuantity;

    // Update cart via API
    this.apiService.addToCart({ productId, quantity: newQuantity }).subscribe({
      next: () => {
        console.log('Added to cart', productId, 'Quantity:', newQuantity);
      },
      error: (err) => console.error('Error adding to cart', err)
    });
  }

  viewProductDetails(productId: string) {
    this.router.navigate(['/', productId]);
  }
}