// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api'; // For PrimeNG Toasts
import { environment } from '../../../environments/environment'; // Import environment

/**
 * Interface for API error response.
 * Assumes the server sends an error object with a 'msg' field.
 */
interface ApiError {
  msg: string;
  // Add other potential error fields if your API returns them
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.API_URL; // Use API_URL from environment

  constructor(
    private http: HttpClient,
    private messageService: MessageService // Inject PrimeNG MessageService
  ) {}

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

  /**
   * Creates HttpHeaders with Authorization token if available.
   * @returns HttpHeaders object.
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', token); // Token already includes "Bearer "
    }
    return headers;
  }

  /**
   * Common error handler for API calls.
   * Displays a toast message using PrimeNG's MessageService.
   * @param error - The HttpErrorResponse object.
   * @returns An Observable that throws the error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorTitle = 'Error';
    let errorMessage = 'Something went wrong. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `Client-side error: ${error.error.message}`;
      errorTitle = 'Network Error';
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      const apiError = error.error as ApiError;
      if (apiError && apiError.msg) {
        errorMessage = apiError.msg;
      } else if (error.message) {
        errorMessage = error.message;
      }

      switch (error.status) {
        case 400:
          errorTitle = 'Bad Request';
          break;
        case 401:
          errorTitle = 'Unauthorized';
          // Potentially redirect to login or refresh token logic here
          break;
        case 403:
          errorTitle = 'Forbidden';
          break;
        case 404:
          errorTitle = 'Not Found';
          // errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorTitle = 'Server Error';
          // errorMessage = 'A server error occurred. Please try again later.';
          break;
        default:
          errorTitle = `Error ${error.status}`;
          break;
      }
    }

    this.messageService.add({
      severity: 'error',
      summary: errorTitle,
      detail: errorMessage ?? 'Something went',
      styleClass: '',
      life: 5000 // Toast duration in milliseconds
    });

    return throwError(() => error); // Propagate the error
  }

  /**
   * Performs a GET request.
   * @param endpoint - The API endpoint (e.g., '/users').
   * @param params - Optional HTTP parameters.
   * @returns An Observable of the response.
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders(), params })
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Performs a POST request.
   * @param endpoint - The API endpoint.
   * @param body - The request payload.
   * @returns An Observable of the response.
   */
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.getHeaders() })
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Performs a PUT request.
   * @param endpoint - The API endpoint.
   * @param body - The request payload.
   * @returns An Observable of the response.
   */
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers: this.getHeaders() })
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Performs a DELETE request.
   * @param endpoint - The API endpoint.
   * @returns An Observable of the response.
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() })
      .pipe(catchError(error => this.handleError(error)));
  }
}
