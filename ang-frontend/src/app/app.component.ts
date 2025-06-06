import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'
import { Observable } from 'rxjs';
import { LoadingService } from './core/services/loading.service'
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { TabsModule } from 'primeng/tabs'
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel'


import { AuthFormComponent } from "./features/auth-form/auth-form.component";
import { CommonModule } from '@angular/common';
import { ProductsListComponent } from './features/products/products-list/products-list.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OrdersListComponent } from './features/orders/orders-list/orders-list.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    ButtonModule, 
    InputTextModule, 
    ToastModule, 
    ProgressSpinnerModule, 
    AuthFormComponent, 
    CommonModule,
    TabsModule,
    OverlayPanelModule,
    ConfirmDialogModule, 
    ProductsListComponent,
    DashboardComponent,
    OrdersListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ang-frontend';

  user: User | null = null;
  authLoading: boolean = true;

  isLoading$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  @ViewChild('userProfilePanel') userProfilePanel: OverlayPanel | undefined;


  constructor(
    private loadingService: LoadingService,
    private authService: AuthService,

  ) {
    this.isLoading$ = this.loadingService.loading$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(ele => {
      this.user = ele;
    })
    this.isLoading$.subscribe(ele => {
      this.authLoading = ele;
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleUserDropdown(event: Event) {
    this.userProfilePanel?.toggle(event);
  }
}
