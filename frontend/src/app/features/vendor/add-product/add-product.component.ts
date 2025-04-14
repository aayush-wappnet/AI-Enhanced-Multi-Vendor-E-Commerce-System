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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Category {
  id: string;
  name: string;
}

interface VendorStore {
  id: string;
  name: string;
  // Add other store properties as needed
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  vendorStores: VendorStore[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      vendorStoreId: ['', Validators.required], // Added vendor store field
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      type: ['physical', Validators.required],
      stock: ['0', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadVendorStores();
  }

  loadCategories(): void {
    this.apiService.get<Category[]>(`${this.apiService.apiUrl}/products/categories`)
      .subscribe({
        next: (categories) => this.categories = categories,
        error: (err) => console.error('Error loading categories', err)
      });
  }

  loadVendorStores(): void {
    const user = this.authService.getUser();
    if (user?.id) {
      this.apiService.get<VendorStore[]>(`${this.apiService.apiUrl}/vendors/user/${user.id}`)
        .subscribe({
          next: (stores) => {
            this.vendorStores = stores;
            // Auto-select the first store if only one exists
            if (stores.length === 1) {
              this.productForm.patchValue({ vendorStoreId: stores[0].id });
            }
          },
          error: (err) => console.error('Error loading vendor stores', err)
        });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      this.previewUrls = [];
      
      for (let file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      const user = this.authService.getUser();
      
      if (user?.id) {
        const formData = new FormData();
        
        // Append all form values except vendorStoreId
        Object.keys(this.productForm.value).forEach(key => {
          if (key !== 'vendorStoreId' && this.productForm.value[key] !== null) {
            formData.append(key, this.productForm.value[key]);
          }
        });
        
        // Append vendorId using the value from vendorStoreId
        const vendorStoreId = this.productForm.get('vendorStoreId')?.value;
        if (vendorStoreId) {
          formData.append('vendorId', vendorStoreId); // Send vendorStoreId as vendorId
        }
        
        // Append images
        this.selectedFiles.forEach(file => {
          formData.append('images', file);
        });
  
        this.apiService.postFormData(`${this.apiService.apiUrl}/products`, formData)
          .subscribe({
            next: () => {
              this.isSubmitting = false;
              // this.router.navigate(['/vendor/dashboard']);
            },
            error: (err) => {
              console.error('Error adding product', err);
              this.isSubmitting = false;
            }
          });
      }
    }
  }
}