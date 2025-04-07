// src/app/features/customer/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs'; // Imported of for default value

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart$: Observable<any> = of({ items: [], total: 0 }); // Initialized with default object

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cart$ = this.apiService.getCart();
  }

  removeFromCart(productId: string) {
    // Implement remove logic when API is ready
    console.log('Remove from cart', productId);
  }

  checkout() {
    // Implement checkout logic when API is ready
    console.log('Checkout initiated');
  }
}