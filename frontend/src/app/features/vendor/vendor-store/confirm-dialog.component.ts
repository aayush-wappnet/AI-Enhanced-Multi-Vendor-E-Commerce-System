import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <form *ngIf="data.isStoreForm || data.isProductForm" [formGroup]="editForm" class="edit-form">
        <!-- Store Form -->
        <div *ngIf="data.isStoreForm">
          <mat-form-field appearance="outline">
            <mat-label>Store Name</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="editForm.get('name')?.invalid">Name is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Business Email</mat-label>
            <input matInput formControlName="businessEmail" type="email">
            <mat-error *ngIf="editForm.get('businessEmail')?.invalid">Invalid email</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Business Contact</mat-label>
            <input matInput formControlName="businessContact">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Logo URL</mat-label>
            <input matInput formControlName="logoUrl">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Website</mat-label>
            <input matInput formControlName="website">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId" required>
              <mat-option *ngFor="let category of data.categories" [value]="category.id">
                {{ category.name }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('categoryId')?.invalid">Category is required</mat-error>
          </mat-form-field>
        </div>
        <!-- Product Form -->
        <div *ngIf="data.isProductForm">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="editForm.get('name')?.invalid">Name is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Price</mat-label>
            <input matInput formControlName="price" type="number" required>
            <mat-error *ngIf="editForm.get('price')?.invalid">Price is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Stock</mat-label>
            <input matInput formControlName="stock" type="number" required>
            <mat-error *ngIf="editForm.get('stock')?.invalid">Stock is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="physical">Physical</mat-option>
              <mat-option value="digital">Digital</mat-option>
              <mat-option value="subscription">Subscription</mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('type')?.invalid">Type is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId" required (selectionChange)="updateSubcategories()">
              <mat-option *ngFor="let category of data.categories" [value]="category.id">
                {{ category.name }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('categoryId')?.invalid">Category is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Subcategory</mat-label>
            <mat-select formControlName="subcategoryId">
              <mat-option [value]="null">None</mat-option>
              <mat-option *ngFor="let subcategory of subcategories" [value]="subcategory.id">
                {{ subcategory.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close((data.isStoreForm || data.isProductForm) ? editForm.value : true)" [disabled]="(data.isStoreForm || data.isProductForm) && !editForm.valid">
        Confirm
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class ConfirmDialogComponent {
  editForm: FormGroup;
  subcategories: Subcategory[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string; 
      message: string; 
      isStoreForm?: boolean; 
      isProductForm?: boolean; 
      formData?: any;
      categories?: Category[];
    },
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: [data.formData?.name || '', this.data.isStoreForm || this.data.isProductForm ? Validators.required : null],
      description: [data.formData?.description || ''],
      address: [data.formData?.address || ''],
      businessEmail: [data.formData?.businessEmail || '', Validators.email],
      businessContact: [data.formData?.businessContact || ''],
      logoUrl: [data.formData?.logoUrl || ''],
      website: [data.formData?.website || ''],
      categoryId: [data.formData?.categoryId || '', this.data.isStoreForm || this.data.isProductForm ? Validators.required : null],
      price: [data.formData?.price || '', this.data.isProductForm ? Validators.required : null],
      stock: [data.formData?.stock || '', this.data.isProductForm ? Validators.required : null],
      type: [data.formData?.type || '', this.data.isProductForm ? Validators.required : null],
      subcategoryId: [data.formData?.subcategoryId || null]
    });

    // Initialize subcategories based on initial categoryId
    this.updateSubcategories();
  }

  updateSubcategories() {
    const categoryId = this.editForm.get('categoryId')?.value;
    const category = this.data.categories?.find(c => c.id === categoryId);
    this.subcategories = category?.subcategories || [];
    if (!this.subcategories.some(sub => sub.id === this.editForm.get('subcategoryId')?.value)) {
      this.editForm.patchValue({ subcategoryId: null });
    }
  }
}