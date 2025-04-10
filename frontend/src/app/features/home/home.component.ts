import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule // Added for icons
  ]
})
export class HomeComponent {
  categories = [
    { name: 'Electronics', icon: 'devices' },
    { name: 'Fashion', icon: 'checkroom' },
    { name: 'Home & Furniture', icon: 'weekend' },
    { name: 'Books', icon: 'book' },
    { name: 'Sports & Outdoors', icon: 'sports_soccer' },
    { name: 'Beauty & Personal Care', icon: 'spa' }
  ];

  @ViewChild('categoriesSection') categoriesSection!: ElementRef;

  constructor(private router: Router) {}

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToCategory(category: string): void {
    this.router.navigate(['/category', category.toLowerCase().replace(' & ', '-')]);
  }
}