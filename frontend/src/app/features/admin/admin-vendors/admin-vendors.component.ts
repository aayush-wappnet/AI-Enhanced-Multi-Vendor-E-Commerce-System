// src/app/admin/admin-vendors/admin-vendors.component.ts
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
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './admin-vendors.component.html',
  styleUrls: ['./admin-vendors.component.scss']
})
export class AdminVendorsComponent implements OnInit {
  vendors$: Observable<any[]>;
  dataSource = new MatTableDataSource<any>([]); // Initialize with empty array
  displayedColumns: string[] = ['id', 'name', 'status', 'actions'];

  constructor(private apiService: ApiService) {
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
    this.apiService.approveVendor(id).subscribe(() => {
      this.vendors$ = this.apiService.getAllVendors().pipe(
        map(vendors => vendors || [])
      );
      this.vendors$.subscribe(data => {
        this.dataSource.data = data;
      });
    });
  }

  rejectVendor(id: number) {
    this.apiService.rejectVendor(id).subscribe(() => {
      this.vendors$ = this.apiService.getAllVendors().pipe(
        map(vendors => vendors || [])
      );
      this.vendors$.subscribe(data => {
        this.dataSource.data = data;
      });
    });
  }
}