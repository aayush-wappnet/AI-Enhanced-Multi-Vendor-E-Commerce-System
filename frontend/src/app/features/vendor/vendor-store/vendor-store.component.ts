import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-vendor-store',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule
  ],
  templateUrl: './vendor-store.component.html',
  styleUrls: ['./vendor-store.component.scss']
})
export class VendorStoreComponent implements OnInit {
  storeForm: FormGroup;
  vendorStores: any[] = [];
  selectedStore: any = null;
  categories: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      address: [''],
      businessEmail: ['', [Validators.email]],
      businessContact: [''],
      logoUrl: [''],
      website: [''],
      categoryId: ['', Validators.required] // Kept for add form, but not used in edit
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadVendorStores();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  loadCategories() {
    this.isLoading = true;
    this.apiService.get<any[]>(`${this.apiService.apiUrl}/products/categories`).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (err) => {
        this.showError('Error loading categories');
        this.isLoading = false;
      }
    });
  }

  loadVendorStores() {
    this.isLoading = true;
    const user = this.authService.getUser();
    if (user?.id) {
      this.apiService.get<any[]>(`${this.apiService.apiUrl}/vendors/user/${user.id}`).subscribe({
        next: (stores) => {
          this.vendorStores = stores;
          this.isLoading = false;
        },
        error: (err) => {
          this.showError('Error loading stores');
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  selectStore(store: any) {
    this.selectedStore = store;
  }

  onSubmit() {
    if (this.storeForm.valid) {
      this.isLoading = true;
      const user = this.authService.getUser();
      if (user?.id) {
        const formData = {
          ...this.storeForm.value,
          userId: user.id
        };

        this.apiService.createVendorStore(formData).subscribe({
          next: () => {
            this.showSuccess('Store created successfully');
            this.storeForm.reset();
            this.loadVendorStores();
            this.isLoading = false;
          },
          error: (err) => {
            this.showError('Error creating store');
            this.isLoading = false;
          }
        });
      }
    }
  }

  editStore(store: any) {
    this.storeForm.patchValue({
      name: store.name,
      description: store.description,
      address: store.address,
      businessEmail: store.businessEmail,
      businessContact: store.businessContact,
      logoUrl: store.logoUrl,
      website: store.website
    });

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Edit Store',
        message: 'Update store details below and confirm to save changes.',
        showForm: true,
        formData: {
          name: store.name,
          description: store.description,
          address: store.address,
          businessEmail: store.businessEmail,
          businessContact: store.businessContact,
          logoUrl: store.logoUrl,
          website: store.website
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const updatedData = {
          ...result,
          categoryId: store.categoryId // Preserve the original categoryId
        };
        this.apiService.updateVendorStore(store.id, updatedData).subscribe({
          next: () => {
            this.showSuccess('Store updated successfully');
            this.loadVendorStores();
            this.selectedStore = null;
            this.isLoading = false;
          },
          error: (err) => {
            this.showError('Error updating store');
            this.isLoading = false;
          }
        });
      }
    });
  }

  deleteStore(storeId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Store',
        message: 'Are you sure you want to delete this store? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.apiService.delete(`${this.apiService.apiUrl}/vendors/${storeId}`).subscribe({
          next: () => {
            this.showSuccess('Store deleted successfully');
            this.loadVendorStores();
            this.selectedStore = null;
            this.isLoading = false;
          },
          error: (err) => {
            this.showError('Error deleting store');
            this.isLoading = false;
          }
        });
      }
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}