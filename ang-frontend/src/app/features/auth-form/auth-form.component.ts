// src/app/features/auth/auth-form/auth-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service'; // Adjusted path
import { LoadingService } from '../../core/services/loading.service'; // Adjusted path
import { User } from '../../core/models/user.model'; // Adjusted path
import { Observable } from 'rxjs';

// PrimeNG Modules
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages'; // For displaying form-specific errors
// import type { Message } from 'primeng/api';

@Component({
  selector: 'app-auth-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    MessagesModule
  ],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading$: Observable<boolean>;
  formMessages: any[] = []; // For displaying messages above the form

  activeTabIndex = 0; // 0 for Login, 1 for Register

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    this.isLoading$ = this.loadingService.loading$;

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
      // Add confirmPassword or email if needed for registration
    });
  }

  ngOnInit(): void {}

  onLoginSubmit(): void {
    this.formMessages = []; // Clear previous messages
    if (this.loginForm.invalid) {
      this.showFormErrors(this.loginForm);
      return;
    }
    // Loading will be handled by the interceptor
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // On successful login, the authService updates its state.
        // The AppComponent will react to isAuthenticated$ and hide this form.
        // console.log('Login successful', response);
        // No need to show success message here, global toast might be enough
        // or AppComponent can handle showing "Welcome user"
      },
      error: (error) => {
        // Error is already handled by ApiService's toast.
        // If you want specific messages on the form itself:
        // this.formMessages = [{ severity: 'error', summary: 'Login Failed', detail: error?.error?.msg || 'Invalid credentials or server error.' }];
        // console.error('Login failed', error);
      }
    });
  }

  onRegisterSubmit(): void {
    this.formMessages = []; // Clear previous messages
    if (this.registerForm.invalid) {
      this.showFormErrors(this.registerForm);
      return;
    }
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        // console.log('Registration successful', response);
        // After successful registration, user is logged in.
      },
      error: (error) => {
        // Error is already handled by ApiService's toast.
        // For specific form messages:
        // this.formMessages = [{ severity: 'error', summary: 'Registration Failed', detail: error?.error?.msg || 'Could not register user.' }];
        // console.error('Registration failed', error);
      }
    });
  }

  private showFormErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control && control.invalid && (control.dirty || control.touched)) {
        // This is a basic way; you might want more sophisticated error display
        // For now, relying on visual cues from input validation (e.g., ng-invalid class)
      }
    });
     this.formMessages = [{ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' }];
  }

  // Helper to switch tabs if needed, or handle tab change event
  onTabChange(event: any) {
    this.activeTabIndex = event.index;
    this.formMessages = []; // Clear messages when switching tabs
    this.loginForm.reset();
    this.registerForm.reset();
  }
}
