// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = null; // Clear previous error
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
        next: () => {
          // Trigger cart count update after login
          this.apiService.getCart().subscribe(); // This will update cartCount$ in ApiService
          this.router.navigate(['/home']); // Redirect to products page
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.errorMessage = err.message || 'Login failed due to an unknown error';
        }
      });
    }
  }
}