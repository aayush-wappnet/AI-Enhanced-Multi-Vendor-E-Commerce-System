import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<any> = of({});
  quantities: { [productId: string]: { cartItemId: number; present: boolean } } = {};

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.product$ = this.apiService.getProduct(+productId).pipe(
        map(product => product || {}),
        tap(product => {
          this.apiService.getCart().subscribe({
            next: (cart) => {
              const item = cart.items.find((i: { product: { id: string | number } }) => i.product.id === product.id);
              if (item) {
                this.quantities[product.id] = { cartItemId: item.id, present: true };
              }
            },
            error: (err) => console.error('Error fetching cart', err)
          });
        })
      );
    }
  }

  addToCart(productId: string, event?: Event) {
    event?.stopPropagation();

    if (this.quantities[productId] && this.quantities[productId].present) {
      const cartItemId = this.quantities[productId].cartItemId;
      delete this.quantities[productId];
      this.apiService.removeFromCart(cartItemId).subscribe({
        next: () => console.log('Removed from cart', productId),
        error: (err) => console.error('Error removing from cart', err)
      });
    } else {
      this.quantities[productId] = { cartItemId: -1, present: true };
      this.apiService.addToCart({ productId, quantity: 1 }).subscribe({
        next: () => console.log('Added to cart', productId),
        error: (err) => console.error('Error adding to cart', err)
      });
    }
  }

  addToWishlist(productId: string) {
    this.apiService.addToWishlist(productId).subscribe({
      next: () => console.log('Added to wishlist', productId),
      error: (err) => console.error('Error adding to wishlist', err)
    });
  }
}