import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { definePreset } from '@primeng/themes';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './core/interceptor/loading';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Needed for PrimeNG


// PrimeNG Modules & Services
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast'; // If you use p-toast component globally
import { ApiService } from './core/services/api.service';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { ReactiveFormsModule } from '@angular/forms';


const EmeraldSlatePreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          0: '#ffffff',
          50: '{emerald.50}',   // Very light emerald
          100: '{emerald.100}',
          200: '{emerald.200}',
          300: '{emerald.300}',
          400: '{emerald.400}',
          500: '{emerald.500}', // Main emerald
          600: '{emerald.600}',
          700: '{emerald.700}',
          800: '{emerald.800}',
          900: '{emerald.900}',
          950: '{emerald.950}',
          color: '#ffffff',
          inverseColor: '{emerald.950}',
          hoverColor: '{emerald.600}',
          activeColor: '{emerald.700}'
        },
        surface: {
          0: '#ffffff',
          50: '{slate.50}',     // Light slate backgrounds
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
        },
        highlight: {
          background: '{emerald.500}',
          focusBackground: '{emerald.600}',
          color: '#ffffff',
          focusColor: '#ffffff'
        }
      },
      dark: {
        primary: {
          0: '{slate.950}',
          50: '{emerald.50}',
          100: '{emerald.100}',
          200: '{emerald.200}',
          300: '{emerald.300}',
          400: '{emerald.400}',
          500: '{emerald.500}',
          600: '{emerald.600}',
          700: '{emerald.700}',
          800: '{emerald.800}',
          900: '{emerald.900}',
          950: '{emerald.950}',
          color: '{emerald.400}',
          inverseColor: '{slate.950}',
          hoverColor: '{emerald.300}',
          activeColor: '{emerald.200}'
        },
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
        },
        highlight: {
          background: 'rgba(52, 211, 153, 0.16)', // emerald with opacity
          focusBackground: 'rgba(52, 211, 153, 0.24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)'
        }
      }
    }
  }
});

// const VioletSlatePreset = definePreset(Aura, {
//   semantic: {
//     colorScheme: {
//       light: {
//         primary: {
//           0: '#ffffff',
//           50: '{violet.50}',
//           100: '{violet.100}',
//           200: '{violet.200}',
//           300: '{violet.300}',
//           400: '{violet.400}',
//           500: '{violet.500}',   // Rich violet
//           600: '{violet.600}',
//           700: '{violet.700}',
//           800: '{violet.800}',
//           900: '{violet.900}',
//           950: '{violet.950}',
//           color: '#ffffff',
//           inverseColor: '{violet.950}',
//           hoverColor: '{violet.600}',
//           activeColor: '{violet.700}'
//         },
//         surface: {
//           0: '#ffffff',
//           50: '{slate.50}',
//           100: '{slate.100}',
//           200: '{slate.200}',
//           300: '{slate.300}',
//           400: '{slate.400}',
//           500: '{slate.500}',
//           600: '{slate.600}',
//           700: '{slate.700}',
//           800: '{slate.800}',
//           900: '{slate.900}',
//           950: '{slate.950}'
//         },
//         highlight: {
//           background: '{violet.500}',
//           focusBackground: '{violet.600}',
//           color: '#ffffff',
//           focusColor: '#ffffff'
//         }
//       },
//       dark: {
//         primary: {
//           0: '#ffffff',
//           50: '{violet.50}',
//           100: '{violet.100}',
//           200: '{violet.200}',
//           300: '{violet.300}',
//           400: '{violet.400}',
//           500: '{violet.500}',
//           600: '{violet.600}',
//           700: '{violet.700}',
//           800: '{violet.800}',
//           900: '{violet.900}',
//           950: '{violet.950}',
//           color: '{violet.400}',
//           inverseColor: '{slate.950}',
//           hoverColor: '{violet.300}',
//           activeColor: '{violet.200}'
//         },
//         surface: {
//           0: '#ffffff',
//           50: '{slate.50}',
//           100: '{slate.100}',
//           200: '{slate.200}',
//           300: '{slate.300}',
//           400: '{slate.400}',
//           500: '{slate.500}',
//           600: '{slate.600}',
//           700: '{slate.700}',
//           800: '{slate.800}',
//           900: '{slate.900}',
//           950: '{slate.950}'
//         },
//         highlight: {
//           background: 'rgba(139, 92, 246, 0.16)',
//           focusBackground: 'rgba(139, 92, 246, 0.24)',
//           color: 'rgba(255,255,255,.87)',
//           focusColor: 'rgba(255,255,255,.87)'
//         }
//       }
//     }
//   }
// });

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura, // EmeraldSlatePreset, //Lara,
      }
    }),
    provideHttpClient(),
    importProvidersFrom([
      BrowserAnimationsModule, // For PrimeNG animations
      ToastModule
    ]),
    MessageService, // PrimeNG MessageService for toasts
    ApiService,     // Your custom API service
    AuthService,    // Your custom Auth service
    LoadingService,  // Your custom Loading service
    ReactiveFormsModule,
    ConfirmationService,
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ]
};
