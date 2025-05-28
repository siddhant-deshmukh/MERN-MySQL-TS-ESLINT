import { Schema, model, Document } from 'mongoose';

// Define the interface for Product properties
export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
}

// Define the Product Schema
const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    minlength: [3, 'Product name must be at least 3 characters long'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0.2, 'Product price must be at least 0.2'],
    max: [1000000, 'Product price cannot exceed 1,000,000'],
    set: (v: number) => parseFloat(v.toFixed(2)), // Ensure two decimal places
  },
  description: {
    type: String,
    maxlength: [1000, 'Product description cannot exceed 1000 characters'],
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Create and export the Product model
const Product = model<IProduct>('Product', productSchema);

export default Product;