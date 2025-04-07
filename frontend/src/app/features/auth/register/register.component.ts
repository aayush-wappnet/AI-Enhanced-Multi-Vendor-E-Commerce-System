import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Added this import
import { MatSelectModule } from '@angular/material/select'; // Added this import

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatSelectModule], // Added MatSelectModule
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]] // Role control remains the same
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password, role } = this.registerForm.value;
      this.authService.register({ firstName, lastName, email, password, role }).subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: (err) => console.error('Registration failed', err)
      });
    }
  }
}