import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<any> = of({});
  quantities: { [key: string]: number } = {}; // Track quantity per product ID

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.product$ = this.apiService.getProduct(+productId).pipe(
        map(product => product || {})
      );
    }
  }

  addToCart(productId: string, delta: number = 0, event?: Event) {
    event?.stopPropagation(); // Prevent any parent click events if applicable
    const currentProductId = productId;

    if (!this.quantities[currentProductId] && delta === 0) {
      this.quantities[currentProductId] = 1; // Initial add sets quantity to 1
    } else if (delta !== 0) {
      const newQuantity = (this.quantities[currentProductId] || 0) + delta;
      if (newQuantity <= 0) {
        delete this.quantities[currentProductId]; // Remove from quantities to show Add to Cart button
        this.apiService.removeFromCart(currentProductId).subscribe({
          next: () => {
            console.log('Removed from cart', currentProductId);
            // Force UI update by triggering change detection (optional, may not be needed with async pipe)
          },
          error: (err) => console.error('Error removing from cart', err)
        });
        return;
      }
      this.quantities[currentProductId] = Math.max(1, newQuantity); // Ensure quantity doesn’t go below 1 (unless removed)
    }

    this.apiService.addToCart({ productId: currentProductId, quantity: this.quantities[currentProductId] }).subscribe({
      next: () => {
        console.log('Added to cart', currentProductId, 'Quantity:', this.quantities[currentProductId]);
      },
      error: (err) => console.error('Error adding to cart', err)
    });
  }

  addToWishlist(productId: string) {
    this.apiService.addToWishlist(productId).subscribe({
      next: () => console.log('Added to wishlist', productId),
      error: (err) => console.error('Error adding to wishlist', err)
    });
  }

  decrementQuantity(productId: string, event: Event) {
    this.addToCart(productId, -1, event);
  }

  incrementQuantity(productId: string, event: Event) {
    this.addToCart(productId, 1, event);
  }
}