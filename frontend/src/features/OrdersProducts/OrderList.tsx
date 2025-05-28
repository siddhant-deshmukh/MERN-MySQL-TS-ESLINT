import { get, del, post, put } from "@/lib/api";
import { addOrder, deleteOrder, setOrders, updateOrder } from "@/redux/slices/orderSlice";
import type { IOrder } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrderForm from "./OrderForm";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/redux/store";


const OrderManagement: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const fetchedOrders: IOrder[] = await get('/orders');
      dispatch(setOrders(fetchedOrders));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSaveOrder = async (orderData: Omit<IOrder, '_id' | 'createdAt' | 'updatedAt' | 'user' | 'productIds'> & { productIds: string[] }, isUpdate: boolean) => {
    setFormLoading(true);
    try {
      if (isUpdate && editingOrder) {
        const updatedOrder: IOrder = await put(`/orders/${editingOrder._id}`, orderData);
        dispatch(updateOrder(updatedOrder));
        setEditingOrder(null); // Clear editing state
      } else {
        const newOrder: IOrder = await post('/orders', orderData);
        dispatch(addOrder(newOrder));
      }
    } catch (err) {
      console.error('Failed to save order:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await del(`/orders/${orderId}`);
        dispatch(deleteOrder(orderId));
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <Button onClick={() => setEditingOrder({ _id: '', userId: 0, productIds: [], totalAmount: 0, createdAt: '', updatedAt: '', user: { id: 0, username: '' } } as IOrder)}>
        Add New Order
      </Button>

      {editingOrder && (
        <OrderForm
          initialOrder={editingOrder}
          onSave={handleSaveOrder}
          onCancel={() => setEditingOrder(null)}
          loading={formLoading}
        />
      )}

      <h3 className="text-xl font-semibold">Order List</h3>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p>No orders available. Add some!</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="p-4 border rounded-md bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold">Order ID: {order._id}</p>
                  <p>User: {order.user.username}</p>
                  <p>Total: ${order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingOrder(order)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order._id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Products:</p>
                <ul className="list-disc pl-5">
                  {order.productIds.slice(0, expandedOrders.has(order._id) ? order.productIds.length : 2).map((product) => (
                    <li key={product._id} className="text-sm">
                      {product.name} (${product.price.toFixed(2)})
                    </li>
                  ))}
                </ul>
                {order.productIds.length > 2 && (
                  <Button variant="link" size="sm" onClick={() => toggleExpandOrder(order._id)} className="mt-1 p-0 h-auto">
                    {expandedOrders.has(order._id) ? 'Show Less' : 'Show All Products'}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;