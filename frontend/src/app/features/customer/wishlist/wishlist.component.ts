// src/app/features/customer/wishlist/wishlist.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs'; // Imported of for default value

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlist$: Observable<any> = of({ items: [] }); // Initialized with default object

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.wishlist$ = this.apiService.getCart(); // Placeholder; replace with actual wishlist API
  }

  removeFromWishlist(productId: string) {
    // Implement remove logic when API is ready
    console.log('Remove from wishlist', productId);
  }
}