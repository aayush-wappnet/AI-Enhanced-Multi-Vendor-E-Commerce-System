// src/app/admin/admin-products/admin-products.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common'; // Removed AsyncPipe since subscription is used
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../admin-vendors/confirmation-dialog.component'; // Reuse or create if not present

// Define Product interface based on expected API response
interface Product {
  id: number;
  name: string;
  status: string;
  // Add other fields as per your API response (e.g., description, price)
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, NgIf], // Removed AsyncPipe
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  products$: Observable<Product[]>; // Declare without initial value
  dataSource = new MatTableDataSource<Product>([]); // Typed DataSource
  displayedColumns: string[] = ['id', 'name', 'status', 'actions'];

  constructor(private apiService: ApiService, public dialog: MatDialog) {
    // Initialize products$ in constructor after apiService is available
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Approve Product', message: 'Are you sure you want to approve this product?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.approveProduct(id).subscribe(() => {
          this.refreshProducts();
        });
      }
    });
  }

  rejectProduct(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Reject Product', message: 'Are you sure you want to reject this product?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.rejectProduct(id).subscribe(() => {
          this.refreshProducts();
        });
      }
    });
  }

  private refreshProducts() {
    this.products$ = this.apiService.getAllProducts().pipe(
      map(products => products || [])
    );
    this.products$.subscribe(data => {
      this.dataSource.data = data;
    });
  }
}