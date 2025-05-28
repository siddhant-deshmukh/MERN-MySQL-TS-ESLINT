import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import type { IOrder } from "@/types";
import { useState } from "react";


interface OrderFormProps {
  initialOrder?: IOrder | null;
  onSave: (order: Omit<IOrder, '_id' | 'createdAt' | 'updatedAt' | 'user' | 'productIds'> & { productIds: string[] }, isUpdate: boolean) => void;
  onCancel: () => void;
  loading: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ initialOrder, onSave, onCancel, loading }) => {
  const [userId, setUserId] = useState(initialOrder?.userId || 0);
  // For simplicity, productIds as a comma-separated string of IDs
  const [productIdsInput, setProductIdsInput] = useState(initialOrder?.productIds.map(p => p._id).join(', ') || '');
  const [totalAmount, setTotalAmount] = useState(initialOrder?.totalAmount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productIdsArray = productIdsInput.split(',').map(id => id.trim()).filter(id => id);
    onSave({ userId, productIds: productIdsArray, totalAmount }, !!initialOrder);
  };

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800 space-y-4">
      <h3 className="text-xl font-semibold mb-2">{initialOrder ? 'Edit Order' : 'Add Order'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="order-userId">User ID</Label>
          <Input
            id="order-userId"
            type="number"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value))}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="order-productIds">Product IDs (comma-separated)</Label>
          <Input
            id="order-productIds"
            type="text"
            value={productIdsInput}
            onChange={(e) => setProductIdsInput(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="order-totalAmount">Total Amount</Label>
          <Input
            id="order-totalAmount"
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
            required
            className="mt-1"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (initialOrder ? 'Saving...' : 'Adding...') : (initialOrder ? 'Save Changes' : 'Add Order')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;