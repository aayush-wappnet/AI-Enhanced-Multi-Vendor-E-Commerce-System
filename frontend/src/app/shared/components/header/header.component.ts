// src/app/shared/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user$: Observable<any>;
  cartCount$!: Observable<number>;
  wishlistCount$ = new BehaviorSubject<number>(0);

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {
    this.user$ = this.authService.user$.pipe(
      tap(user => console.log('User from AuthService (with token):', user, 'Token:', authService.getToken()))
    );
  }

  ngOnInit() {
    this.cartCount$ = this.apiService.cartCount$;
    // Assuming wishlist has a separate endpoint (e.g., /wishlist). Adjust if different.
    this.apiService.getCart().subscribe(cart => {
      this.wishlistCount$.next(cart.items?.length || 0); // Note: This should ideally be getWishlist if separate
    });
    // If wishlist is separate, uncomment and adjust the endpoint:
    // this.apiService.getWishlist().subscribe(wishlist => {
    //   this.wishlistCount$.next(wishlist.length || 0);
    // });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  addToCart(productId: string) {
    this.apiService.addToCart({ productId, quantity: 1 }).subscribe({
      next: () => {
        console.log('Added to cart from header', productId);
        this.apiService.getCart().subscribe(cart => {
          this.apiService.cartCountSubject.next(cart.items?.length || 0);
        });
      },
      error: (err) => console.error('Error adding to cart', err)
    });
  }

  addToWishlist(productId: string) {
    this.apiService.addToWishlist(productId).subscribe({
      next: () => {
        console.log('Added to wishlist', productId);
        // Update wishlist count if a separate endpoint exists
        // this.apiService.getWishlist().subscribe(wishlist => {
        //   this.wishlistCount$.next(wishlist.length || 0);
        // });
      },
      error: (err) => console.error('Error adding to wishlist', err)
    });
  }
}