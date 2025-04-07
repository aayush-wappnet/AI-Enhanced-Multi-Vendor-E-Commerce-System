// src/app/admin/admin-products/admin-products.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  products$: Observable<any[]>;
  dataSource = new MatTableDataSource<any>([]); // Initialize with empty array
  displayedColumns: string[] = ['id', 'name', 'status', 'actions'];

  constructor(private apiService: ApiService) {
    this.products$ = this.apiService.getAllProducts().pipe(
      map(products => products || [])
    );
  }

  ngOnInit() {
    // Subscribe to the Observable and update the dataSource
    this.products$.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  approveProduct(id: number) {
    this.apiService.approveProduct(id).subscribe(() => {
      this.products$ = this.apiService.getAllProducts().pipe(
        map(products => products || [])
      );
      this.products$.subscribe(data => {
        this.dataSource.data = data;
      });
    });
  }

  rejectProduct(id: number) {
    this.apiService.rejectProduct(id).subscribe(() => {
      this.products$ = this.apiService.getAllProducts().pipe(
        map(products => products || [])
      );
      this.products$.subscribe(data => {
        this.dataSource.data = data;
      });
    });
  }
}