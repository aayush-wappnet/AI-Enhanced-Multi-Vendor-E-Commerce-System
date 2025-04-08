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
  quantities: { [productId: string]: { cartItemId: number; present: boolean } } = {};

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.products$ = this.apiService.getProducts().pipe(
      tap(products => {
        this.apiService.getCart().subscribe({
          next: (cart) => {
            this.quantities = {};
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

  viewProductDetails(productId: string) {
    this.router.navigate([`/products/${productId}`]);
  }
}