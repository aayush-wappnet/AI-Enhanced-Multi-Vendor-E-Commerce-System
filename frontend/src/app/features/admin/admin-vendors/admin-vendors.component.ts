// src/app/admin/admin-vendors/admin-vendors.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

// Define Vendor interface based on expected API response
interface Vendor {
  id: number;
  name: string;
  status: string;
  // Add other fields as per your API response
}

@Component({
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, NgIf],
  templateUrl: './admin-vendors.component.html',
  styleUrls: ['./admin-vendors.component.scss']
})
export class AdminVendorsComponent implements OnInit {
  vendors$: Observable<Vendor[]>; // Declare without initial value
  dataSource = new MatTableDataSource<Vendor>([]); // Typed DataSource
  displayedColumns: string[] = ['id', 'name', 'status', 'actions'];

  constructor(private apiService: ApiService, public dialog: MatDialog) {
    // Initialize vendors$ in constructor after apiService is available
    this.vendors$ = this.apiService.getAllVendors().pipe(
      map(vendors => vendors || [])
    );
  }

  ngOnInit() {
    // Subscribe to the Observable and update the dataSource
    this.vendors$.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  approveVendor(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Approve Vendor', message: 'Are you sure you want to approve this vendor?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.approveVendor(id).subscribe(() => {
          this.refreshVendors();
        });
      }
    });
  }

  rejectVendor(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Reject Vendor', message: 'Are you sure you want to reject this vendor?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.rejectVendor(id).subscribe(() => {
          this.refreshVendors();
        });
      }
    });
  }

  private refreshVendors() {
    this.vendors$ = this.apiService.getAllVendors().pipe(
      map(vendors => vendors || [])
    );
    this.vendors$.subscribe(data => {
      this.dataSource.data = data;
    });
  }
}