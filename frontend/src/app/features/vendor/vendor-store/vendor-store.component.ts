import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDividerModule
  ],
  templateUrl: './vendor-store.component.html',
  styleUrls: ['./vendor-store.component.scss']
})
export class VendorStoreComponent implements OnInit {
  storeForm: FormGroup;
  vendorStore: any;
  categories: any[] = [];
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      address: [''],
      businessEmail: ['', [Validators.email]],
      businessContact: [''],
      logoUrl: [''],
      website: [''],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadVendorStore();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  loadCategories() {
    this.apiService.get<any[]>(`${this.apiService.apiUrl}/products/categories`).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadVendorStore() {
    const user = this.authService.getUser();
    if (user?.id) {
      this.apiService.get<any>(`${this.apiService.apiUrl}/vendors/${user.id}`).subscribe({
        next: (store) => {
          this.vendorStore = store;
          if (store) {
            this.storeForm.patchValue({
              name: store.name,
              description: store.description,
              address: store.address,
              businessEmail: store.businessEmail,
              businessContact: store.businessContact,
              logoUrl: store.logoUrl,
              website: store.website,
              categoryId: store.categoryId
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading store', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  onSubmit() {
    if (this.storeForm.valid) {
      const user = this.authService.getUser();
      if (user?.id) {
        const formData = {
          ...this.storeForm.value,
          userId: user.id
        };

        const apiCall = this.vendorStore 
          ? this.apiService.put(`${this.apiService.apiUrl}/vendors/`, formData)
          : this.apiService.post(`${this.apiService.apiUrl}/vendors`, formData);

        apiCall.subscribe({
          next: () => {
            this.loadVendorStore();
            this.router.navigate(['/vendor/dashboard']);
          },
          error: (err) => console.error('Error saving store', err)
        });
      }
    }
  }
}