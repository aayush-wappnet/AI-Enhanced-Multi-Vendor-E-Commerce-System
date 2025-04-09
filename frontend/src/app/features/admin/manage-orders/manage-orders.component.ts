// src/app/features/admin/manage-orders/manage-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.scss']
})
export class ManageOrdersComponent implements OnInit {
  orders$: Observable<any[]>;
  displayedColumns: string[] = ['id', 'user', 'totalAmount', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();

  constructor(private apiService: ApiService, public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.orders$ = this.apiService.getAllOrders();
  }

  ngOnInit() {
    this.orders$.subscribe(orders => {
      this.dataSource.data = orders;
    });
  }

  updateStatus(orderId: number, newStatus: string) {
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 });
        this.ngOnInit(); // Refresh the list
      },
      error: (err) => {
        this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'hourglass_empty';
      case 'confirmed': return 'check_circle';
      case 'shipped': return 'local_shipping';
      case 'delivered': return 'done_all';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  }
}