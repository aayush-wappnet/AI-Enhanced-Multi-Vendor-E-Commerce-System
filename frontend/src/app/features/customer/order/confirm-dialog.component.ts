// Add a simple confirmation dialog component

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, CommonModule],
    template: `
      <h2 mat-dialog-title>Confirm Cancellation</h2>
      <mat-dialog-content>Are you sure you want to cancel this order?</mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="onNoClick()">No</button>
        <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Yes</button>
      </mat-dialog-actions>
    `,
  })
  export class ConfirmDialogComponent {
    constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
  
    onNoClick(): void {
      this.dialogRef.close(false);
    }
  }