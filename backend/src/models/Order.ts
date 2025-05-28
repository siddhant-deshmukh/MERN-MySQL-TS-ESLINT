import { Schema, model, Document } from 'mongoose';
import mongoose from 'mongoose'; // Import mongoose for Schema.Types.ObjectId


export interface IOrderCreate {
  userId: number; // References MySQL User.id (which is a number)
  productIds: mongoose.Types.ObjectId[]; // Array of MongoDB Product _id's
  totalAmount: number;
}

// Define the interface for Order properties
export interface IOrder extends Document, IOrderCreate {
}

// Define the Order Schema
const orderSchema = new Schema<IOrder>({
  userId: {
    type: Number, // Match the type of MySQL User.id
    required: [true, 'User ID is required'],
  },
  productIds: {
    type: [mongoose.Schema.Types.ObjectId], // Array of MongoDB ObjectId
    required: [true, 'Product IDs are required'],
    ref: 'Product',
    validate: {
      validator: function(v: mongoose.Types.ObjectId[]) {
        // Ensure the array is not empty
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Product IDs array cannot be empty.',
    },
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    set: (v: number) => parseFloat(v.toFixed(2)), // Ensure two decimal places
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Create and export the Order model
const Order = model<IOrder>('Order', orderSchema);

export default Order;