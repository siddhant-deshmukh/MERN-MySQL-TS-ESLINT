import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber'
import { DialogModule } from 'primeng/dialog'
import { TableModule } from 'primeng/table'
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';



export interface Product {
  _id?: string; // Optional for new products, mandatory for existing
  name: string;
  price: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

@Component({
  selector: 'app-products-list',
  imports: [InputNumberModule, DialogModule, TableModule, CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  displayProductDialog: boolean = false;
  productForm: FormGroup;
  isEditMode: boolean = false;
  selectedProduct: Product | null = null; // To hold product being edited

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService, // For toast messages
    private confirmationService: ConfirmationService // For confirmation dialog
  ) {
    // Initialize the form with validators
    this.productForm = this.fb.group({
      _id: [null], // Hidden field for product ID in edit mode
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      description: [''] // Optional field
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Loads all products from the API.
   */
  loadProducts(): void {
    this.apiService.get<Product[]>('/products/')
      .subscribe({
        next: (data) => {
          this.products = data;
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Products loaded successfully'});
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to load products: ${err.message}`});
          console.error('Error loading products:', err);
        }
      });
  }

  /**
   * Displays the dialog for creating a new product.
   */
  showCreateDialog(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset(); // Clear the form
    this.displayProductDialog = true;
  }

  /**
   * Displays the dialog for editing an existing product.
   * @param product The product to be edited.
   */
  showEditDialog(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = { ...product }; // Create a copy to avoid direct mutation
    // Patch form values with existing product data
    this.productForm.patchValue(this.selectedProduct); 
    this.displayProductDialog = true;
  }

  /**
   * Saves a new product or updates an existing one.
   */
  saveProduct(): void {
    if (this.productForm.invalid) {
      this.messageService.add({severity:'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.'});
      this.productForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode && this.selectedProduct?._id) {
      // Update existing product
      this.apiService.put<Product>(`/products/${this.selectedProduct._id}`, productData)
        .subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Product updated successfully'});
            this.hideDialog();
            this.loadProducts(); // Refresh the list
          },
          error: (err) => {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to update product: ${err.message}`});
            console.error('Error updating product:', err);
          }
        });
    } else {
      // Create new product
      // Ensure _id is not sent for new products
      delete productData._id; 
      this.apiService.post<Product>('/products/', productData)
        .subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Product created successfully'});
            this.hideDialog();
            this.loadProducts(); // Refresh the list
          },
          error: (err) => {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to create product: ${err.message}`});
            console.error('Error creating product:', err);
          }
        });
    }
  }

  /**
   * Deletes a product after confirmation.
   * @param product The product to be deleted.
   */
  deleteProduct(product: Product): void {
    if (!product._id) {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Product ID is missing for deletion.'});
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete product "${product.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.apiService.delete<void>(`/products/${product._id}`)
          .subscribe({
            next: () => {
              this.messageService.add({severity:'success', summary: 'Success', detail: 'Product deleted successfully'});
              this.loadProducts(); // Refresh the list
            },
            error: (err) => {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Failed to delete product: ${err.message}`});
              console.error('Error deleting product:', err);
            }
          });
      }
    });
  }

  /**
   * Hides the product form dialog.
   */
  hideDialog(): void {
    this.displayProductDialog = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }
}
