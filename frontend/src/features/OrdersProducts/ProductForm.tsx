import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import type { IProduct } from "@/types";
import { useState } from "react";

// Product Form Component
interface ProductFormProps {
  initialProduct?: IProduct | null;
  onSave: (product: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>, isUpdate: boolean) => void;
  onCancel: () => void;
  loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSave, onCancel, loading }) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [price, setPrice] = useState(initialProduct?.price || 0);
  const [description, setDescription] = useState(initialProduct?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, price, description }, !!initialProduct);
  };

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800 space-y-4">
      <h3 className="text-xl font-semibold mb-2">{initialProduct ? 'Edit Product' : 'Add Product'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="product-name">Name</Label>
          <Input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="product-price">Price</Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="product-description">Description</Label>
          <Input
            id="product-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (initialProduct ? 'Saving...' : 'Adding...') : (initialProduct ? 'Save Changes' : 'Add Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;