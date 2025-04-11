import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, Subscription } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product$: Observable<any> = of({});
  recommendations$: Observable<any[]> = of([]);
  quantities: { [productId: string]: { cartItemId: number; present: boolean } } = {};
  private paramSubscription: Subscription | undefined;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Subscribe to route parameter changes
    this.paramSubscription = this.route.paramMap.pipe(
      switchMap(params => {
        const productId = params.get('id');
        console.log('Route parameter changed to ID:', productId); // Debug
        if (productId) {
          return this.apiService.getProduct(+productId).pipe(
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
              // Fetch recommendations after getting the product
              this.recommendations$ = this.apiService.getRecommendations(+productId);
            })
          );
        }
        return of({});
      })
    ).subscribe(product => {
      this.product$ = of(product);
    });
  }

  ngOnDestroy() {
    // Clean up subscription to avoid memory leaks
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
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

  onRecommendationClick(productId: number) {
    if (productId) {
      console.log('Attempting to navigate to:', ['/products', productId]); // Debug
      this.router.navigate(['/products', productId], { skipLocationChange: false, replaceUrl: false }).then(success => {
        if (!success) {
          console.error('Navigation failed for product ID:', productId);
          console.log('Current URL:', window.location.href); // Debug current URL
        } else {
          console.log('Navigation succeeded for product ID:', productId);
        }
      }).catch(err => console.error('Navigation error:', err));
    } else {
      console.warn('Invalid product ID for navigation');
    }
  }
}