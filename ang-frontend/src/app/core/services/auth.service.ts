// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router'; // For potential navigation

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject to hold the current user state. Null if not logged in.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // BehaviorSubject to hold authentication status
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router // Inject Router for navigation if needed
    ) {
    // Attempt to load user from token on service initialization
    this.initAuth();
  }

  /**
   * Gets the current user value synchronously.
   * @returns The current User object or null.
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Checks local storage for a token and tries to validate it with the backend.
   * Called on application startup.
   */
  initAuth(): void {
    const token = this.getAuthToken();
    console.log('token', token);
    if (token) {
      // If token exists, try to fetch user profile
      this.apiService.get<{ user: User }>('/u') // Assuming '/u' returns the user object directly
        .pipe(
          tap(res => {
            if (res && res.user && res.user.id && res.user.username) {
              console.log('res.user', res.user);
              this.currentUserSubject.next(res.user);
              this.isAuthenticatedSubject.next(true);
            } else {
              // Invalid res.user data from /u endpoint
              this.logout(); // Clear token and state
            }
          }),
          catchError((err) => {
            console.log('error', err);
            // Token is invalid or expired, or API call failed
            this.logout(); // Clear token and state
            return of(null); // Return an observable that completes
          })
        ).subscribe();
    } else {
      // No token found, ensure user is logged out
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Logs in the user.
   * @param credentials - Object containing username and password.
   * @returns An Observable of the AuthResponse.
   */
  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/login', credentials).pipe(
      tap(response => {
        if (response && response.user && response.token) {
          this.setSession(response);
        } else {
          // Handle cases where response is not as expected
          // The ApiService's error handler will usually catch HTTP errors
          // This is for structurally incorrect success responses
          throw new Error('Invalid login response');
        }
      }),
      catchError(error => {
        this.isAuthenticatedSubject.next(false); // Ensure state is false on login error
        this.currentUserSubject.next(null);
        return throwError(() => error); // Re-throw error to be handled by component
      })
    );
  }

  /**
   * Registers a new user.
   * @param credentials - Object containing username and password.
   * @returns An Observable of the AuthResponse.
   */
  register(credentials: { username: string, password: string }): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/register', credentials).pipe(
      tap(response => {
        if (response && response.user && response.token) {
          this.setSession(response);
        } else {
          throw new Error('Invalid registration response');
        }
      }),
      catchError(error => {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the current user.
   * Clears session data and navigates to the login page (optional).
   */
  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    // Optionally navigate to login page
    // this.router.navigate(['/login']); // Make sure '/login' route exists
  }

  /**
   * Stores user and token in localStorage and updates BehaviorSubjects.
   * @param authResponse - The response from login/register API.
   */
  private setSession(authResponse: AuthResponse): void {
    console.log('setSession');
    if (typeof window !== 'undefined' && window.localStorage) {
      // Prepend "Bearer " to the token before storing if your API expects it
      // The prompt specified the token is already in the correct format from the server.
      // But if it's just the raw JWT, you'd do: `localStorage.setItem('authToken', `Bearer ${authResponse.token}`);`
      // Based on "same token by adding Bearer in front of it in localStorage",
      // let's assume the API sends raw token and we add Bearer here.
      localStorage.setItem('authToken', `Bearer ${authResponse.token}`);
      console.log('Token set');
    }
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Retrieves the authentication token from localStorage.
   * @returns The token string or null if not found.
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }
}
