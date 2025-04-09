// src/app/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatTableModule, AsyncPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  vendorsCount$: Observable<number>;
  productsCount$: Observable<number>;
  approvedProductsCount$: Observable<number>;
  rejectedProductsCount$: Observable<number>;
  pendingVendorsCount$: Observable<number>;
  approvedVendorsCount$: Observable<number>;
  rejectedVendorsCount$: Observable<number>;
  totalOrders$: Observable<number>;
  totalSales$: Observable<number>;
  totalProductsSold$: Observable<number>;

  constructor(private apiService: ApiService) {
    this.vendorsCount$ = this.apiService.getAllVendors().pipe(
      map(vendors => vendors.length)
    );
    this.productsCount$ = this.apiService.getAllProducts().pipe(
      map(products => products.length)
    );
    this.approvedProductsCount$ = this.apiService.getApprovedProducts().pipe(
      map(products => products.length)
    );
    this.rejectedProductsCount$ = this.apiService.getRejectedProducts().pipe(
      map(products => products.length)
    );
    this.pendingVendorsCount$ = this.apiService.getPendingVendorsCount();
    this.approvedVendorsCount$ = this.apiService.getApprovedVendorsCount();
    this.rejectedVendorsCount$ = this.apiService.getRejectedVendorsCount();
    this.totalOrders$ = this.apiService.getTotalOrders();
    this.totalSales$ = this.apiService.getTotalSales().pipe(
      map(sales => sales || 0) // Handle null/undefined
    );
    this.totalProductsSold$ = this.apiService.getTotalProductsSold().pipe(
      map(productsSold => productsSold || 0) // Handle null/undefined
    );
  }

  ngOnInit() {}
}