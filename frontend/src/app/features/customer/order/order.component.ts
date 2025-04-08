import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Interfaces based on the API response
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  type: string;
  imageUrls: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: number;
  transactionId: string;
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  user?: User;
  orderItems: OrderItem[];
  payment: Payment | null;
  totalAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  orders$: Observable<Order[]> = of([]);
  selectedOrder: Order | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orders$ = this.apiService.getOrders();
  }

  loadOrderById(id: number) {
    this.orders$ = this.apiService.getOrderById(id).pipe(
      switchMap((order: Order) => of([order]))
    );
    this.selectedOrder = null; // Reset for now; will be set by detailed view
  }

  viewDetails(order: Order) {
    this.selectedOrder = order;
  }
}