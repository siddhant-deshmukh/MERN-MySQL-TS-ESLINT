import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber'
import { DialogModule } from 'primeng/dialog'
import { TableModule } from 'primeng/table'
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../products/products-list/products-list.component';
import { User } from '../../../core/models/user.model';

export interface Order {
  _id?: string; // Optional for new orders, mandatory for existing
  userId: number;
  productIds: Product[];
  user: User;
  totalAmount: number;
}

@Component({
  selector: 'app-orders-list',
  imports: [InputNumberModule, DialogModule, TableModule, CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
})
export class OrdersListComponent implements OnInit{
  orders: Order[] = [];
  displayProductDialog: boolean = false;
  productForm: FormGroup;
  isEditMode: boolean = false;
  selectedProduct: Order | null = null; // To hold order being edited

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService, // For toast messages
    private confirmationService: ConfirmationService // For confirmation dialog
  ) {
    // Initialize the form with validators
    this.productForm = this.fb.group({
      _id: [null], // Hidden field for order ID in edit mode
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      description: [''] // Optional field
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Loads all orders from the API.
   */
  loadProducts(): void {
    this.apiService.get<Order[]>('/orders/')
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Products loaded successfully'});
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to load orders: ${err.message}`});
          console.error('Error loading orders:', err);
        }
      });
  }

  /**
   * Displays the dialog for creating a new order.
   */
  showCreateDialog(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset(); // Clear the form
    this.displayProductDialog = true;
  }

  /**
   * Displays the dialog for editing an existing order.
   * @param order The order to be edited.
   */
  showEditDialog(order: Order): void {
    this.isEditMode = true;
    this.selectedProduct = { ...order }; // Create a copy to avoid direct mutation
    // Patch form values with existing order data
    this.productForm.patchValue(this.selectedProduct); 
    this.displayProductDialog = true;
  }

  /**
   * Saves a new order or updates an existing one.
   */
  saveProduct(): void {
    if (this.productForm.invalid) {
      this.messageService.add({severity:'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.'});
      this.productForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode && this.selectedProduct?._id) {
      // Update existing order
      this.apiService.put<Order>(`/orders/${this.selectedProduct._id}`, productData)
        .subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Order updated successfully'});
            this.hideDialog();
            this.loadProducts(); // Refresh the list
          },
          error: (err) => {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to update order: ${err.message}`});
            console.error('Error updating order:', err);
          }
        });
    } else {
      // Create new order
      // Ensure _id is not sent for new orders
      delete productData._id; 
      this.apiService.post<Order>('/orders/', productData)
        .subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Order created successfully'});
            this.hideDialog();
            this.loadProducts(); // Refresh the list
          },
          error: (err) => {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to create order: ${err.message}`});
            console.error('Error creating order:', err);
          }
        });
    }
  }

  /**
   * Deletes a order after confirmation.
   * @param order The order to be deleted.
   */
  deleteProduct(order: Order): void {
    if (!order._id) {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Order ID is missing for deletion.'});
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete order"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.apiService.delete<void>(`/orders/${order._id}`)
          .subscribe({
            next: () => {
              this.messageService.add({severity:'success', summary: 'Success', detail: 'Order deleted successfully'});
              this.loadProducts(); // Refresh the list
            },
            error: (err) => {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to delete order: ${err.message}`});
              console.error('Error deleting order:', err);
            }
          });
      }
    });
  }

  /**
   * Hides the order form dialog.
   */
  hideDialog(): void {
    this.displayProductDialog = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }
}
