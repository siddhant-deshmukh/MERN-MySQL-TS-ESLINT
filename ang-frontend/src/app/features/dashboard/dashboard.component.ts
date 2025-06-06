import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

export interface Rate {
  currency: string; // E.g., "USD", "EUR"
  rate: number;     // The exchange rate value
}

/**
 * Interface for the overall exchange rate response from the API.
 */
export interface ExchangeRateResponse {
  baseCurrency: string; // The base currency (e.g., "INR")
  date: string;         // The date of the exchange rates
  rates: Rate[];        // Array of currency rates
  msg: string;          // A message from the API
}


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Holds the fetched exchange rate data
  exchangeRates: ExchangeRateResponse | null = null;
  // Flag to indicate if data is currently being loaded
  isLoading: boolean = true;
  // Stores any error message if the API call fails
  error: string | null = null;
  // Symbol for the base currency (defaults to INR symbol)
  baseCurrencySymbol: string = '₹';

  // A map to get currency symbols for various currency codes
  currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    INR: '₹',
  }
  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) { }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties.
   * It's used here to fetch exchange rates when the component loads.
   */
  ngOnInit(): void {
    this.fetchExchangeRates();
  }

  /**
   * Fetches exchange rates from the API service.
   * Handles loading states, success, and error scenarios.
   */
  fetchExchangeRates(): void {
    this.isLoading = true; // Set loading to true before fetching
    this.error = null;     // Clear any previous errors

    // Subscribe to the API service call for exchange rates
    this.apiService.get<ExchangeRateResponse>('/exc?BASE_CURRENCY=INR')
      .subscribe({
        next: (data) => {
          // On successful data reception
          this.exchangeRates = data; // Store the response data
          // Update the base currency symbol based on the fetched data
          this.baseCurrencySymbol = this.getCurrencySymbol(data.baseCurrency);
          this.isLoading = false; // Set loading to false
          // Display a success toast message
          this.messageService.add({severity:'success', summary: 'Success', detail: data.msg});
        },
        error: (err) => {
          // On error during API call
          this.isLoading = false; // Set loading to false
          // Construct an error message
          this.error = `Failed to load exchange rates: ${err.message || 'Unknown error'}`;
          // Display an error toast message
          this.messageService.add({severity:'error', summary: 'Error', detail: this.error});
          // Log the error to console for debugging
          console.error('Error loading exchange rates:', err);
        }
      });
  }

  /**
   * Returns the currency symbol for a given currency code.
   * @param currencyCode - The three-letter currency code (e.g., "USD").
   * @returns The corresponding currency symbol or the code itself if no symbol is found.
   */
  getCurrencySymbol(currencyCode: string): string {
    return this.currencySymbols[currencyCode.toUpperCase()] || currencyCode;
  }

  /**
   * Calculates the inverse of a given rate.
   * This is useful for showing how much of the base currency 1 unit of foreign currency costs.
   * @param rate - The direct exchange rate (e.g., 1 INR = 0.0117 USD).
   * @returns The inverse rate (e.g., 1 USD = 1/0.0117 INR). Returns 0 if rate is non-positive.
   */
  getInverseRate(rate: number): number {
    return rate > 0 ? 1 / rate : 0;
  }
}
