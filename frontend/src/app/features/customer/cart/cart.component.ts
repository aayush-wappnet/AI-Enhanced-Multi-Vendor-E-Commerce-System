import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cart$: Observable<any> = of({ items: [], total: 0 });
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  @ViewChild('nameElement') nameElementRef!: ElementRef;
  @ViewChild('addressElement') addressElementRef!: ElementRef;
  stripe: any;
  card: any;
  orderId: number | null = null;
  paymentError: string | null = null;
  paymentSuccess: boolean = false;
  isCardMounted: boolean = false;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    this.loadCart();
    try {
      this.stripe = await loadStripe(`${environment.stripePublicKey}`); // Replace with your Stripe test publishable key
      if (!this.stripe) {
        console.error('Failed to load Stripe.js');
        this.paymentError = 'Failed to initialize payment system';
        return;
      }
      this.card = this.stripe.elements().create('card');
      console.log('Stripe initialized, card element created');
    } catch (error) {
      console.error('Error loading Stripe:', error);
      this.paymentError = 'Error initializing payment system';
    }
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
    this.apiService
      .put(`${this.apiService.apiUrl}/cart/item/${cartItemId}`, { quantity })
      .pipe(switchMap(() => this.apiService.getCart()))
      .subscribe((updatedCart) => {
        this.cart$ = of(updatedCart);
      });
  }

  removeFromCart(cartItemId: number) {
    this.apiService
      .delete(`${this.apiService.apiUrl}/cart/item/${cartItemId}`)
      .pipe(switchMap(() => this.apiService.getCart()))
      .subscribe((updatedCart) => {
        this.cart$ = of(updatedCart);
      });
  }

  private waitForElement(): Promise<void> {
    return new Promise((resolve) => {
      const checkElement = () => {
        if (this.cardElementRef && this.cardElementRef.nativeElement) {
          console.log('Card element found in DOM');
          resolve();
        } else {
          console.log('Waiting for card element...');
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  }

  async checkout() {
    this.paymentError = null;
    this.paymentSuccess = false;

    this.apiService.post(`${this.apiService.apiUrl}/orders/checkout`, {}).pipe(
      catchError((error) => {
        console.error('Error creating order:', error);
        this.paymentError = error.message || 'Failed to create order';
        return [];
      })
    ).subscribe({
      next: async (order: any) => {
        this.orderId = order.id;
        const amount = order.totalAmount;
        console.log('Order created, orderId:', this.orderId);

        if (!this.isCardMounted) {
          await this.waitForElement();
          this.card.mount(this.cardElementRef.nativeElement);
          this.isCardMounted = true;
          console.log('Card element mounted');
        }

        this.apiService.post(`${this.apiService.apiUrl}/payments/intent`, { orderId: this.orderId, amount }).pipe(
          catchError((error) => {
            console.error('Payment intent error:', error);
            this.paymentError = error.error?.message || error.message || 'Failed to create payment intent';
            return [];
          })
        ).subscribe({
          next: async (response: any) => {
            const clientSecret = response.clientSecret;
            console.log('Payment intent created, clientSecret:', clientSecret);

            // Collect customer data from input fields
            const name = this.nameElementRef.nativeElement.value;
            const address = {
              line1: this.addressElementRef.nativeElement.value || '123 Test Street',
              city: 'Test City',
              postal_code: '12345',
              country: 'IN',
            };

            if (!name) {
              this.paymentError = 'Customer name is required';
              return;
            }

            const billingDetails = {
              name: name,
              address: address,
            };

            const result = await this.stripe.confirmCardPayment(clientSecret, {
              payment_method: {
                card: this.card,
                billing_details: billingDetails, // Pass customer name and address
              },
            });

            if (result.error) {
              this.paymentError = result.error.message;
              console.error('Payment error:', result.error.message);
            } else if (result.paymentIntent.status === 'succeeded') {
              console.log('Payment succeeded, paymentIntentId:', result.paymentIntent.id);
              this.apiService
                .post(`${this.apiService.apiUrl}/payments/confirm`, {
                  orderId: this.orderId,
                  paymentIntentId: result.paymentIntent.id,
                })
                .subscribe({
                  next: () => {
                    this.paymentSuccess = true;
                    this.loadCart();
                    console.log('Payment confirmed with backend');
                  },
                  error: (err) => {
                    this.paymentError = err.message;
                    console.error('Error confirming payment:', err.message);
                  },
                });
            }
          },
          error: (err) => {
            this.paymentError = err.message;
            console.error('Error in payment intent subscription:', err);
          },
        });
      },
      error: (err) => {
        this.paymentError = err.message;
        console.error('Error in order creation subscription:', err);
      },
    });
  }

  calculateItemTotal(price: string, quantity: number): number {
    return parseFloat(price) * quantity;
  }

  calculateTotal(cart: any): number {
    return cart.items.reduce((sum: number, item: any) => sum + this.calculateItemTotal(item.product.price, item.quantity), 0);
  }
}