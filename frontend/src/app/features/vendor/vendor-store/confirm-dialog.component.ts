import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <form *ngIf="data.showForm" [formGroup]="editForm" class="edit-form">
        <mat-form-field appearance="outline">
          <mat-label>Store Name</mat-label>
          <input matInput formControlName="name" required>
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
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(data.showForm ? editForm.value : true)" [disabled]="data.showForm && !editForm.valid">
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

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string; 
      message: string; 
      showForm?: boolean; 
      formData?: any;
    },
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: [data.formData?.name || '', Validators.required],
      description: [data.formData?.description || ''],
      address: [data.formData?.address || ''],
      businessEmail: [data.formData?.businessEmail || '', Validators.email],
      businessContact: [data.formData?.businessContact || ''],
      logoUrl: [data.formData?.logoUrl || ''],
      website: [data.formData?.website || '']
    });
  }
}