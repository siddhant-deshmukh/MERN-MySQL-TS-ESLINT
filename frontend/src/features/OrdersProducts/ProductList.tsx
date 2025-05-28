import { get, del, post, put } from "@/lib/api";
import { setProducts, addProduct, deleteProduct, updateProduct } from "@/redux/slices/productSlice";
import type { IProduct } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductForm from "./ProductForm";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/redux/store";
import { TbPlus, TbPencil, TbTrash } from "react-icons/tb";

// Product Management Component
const ProductManagement: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.products);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const fetchedProducts: IProduct[] = await get('/products');
      dispatch(setProducts(fetchedProducts));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = async (productData: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>, isUpdate: boolean) => {
    setFormLoading(true);
    try {
      if (editingProduct && editingProduct._id) {
        const updatedProduct: IProduct = await put(`/products/${editingProduct._id}`, productData);
        dispatch(updateProduct(updatedProduct));
        setEditingProduct(null); // Clear editing state
      } else {
        const newProduct: IProduct = await post('/products', productData);
        dispatch(addProduct(newProduct));
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await del(`/products/${productId}`);
        dispatch(deleteProduct(productId));
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {editingProduct && (
        <ProductForm
          initialProduct={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => setEditingProduct(null)}
          loading={formLoading}
        />
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Product List</h3>
        <Button onClick={() => setEditingProduct({ _id: '', name: '', price: 0, description: '', createdAt: '', updatedAt: '' } as IProduct)}>
          <TbPlus  />
        </Button>
      </div>
      <div className="space-y-4">
        {products.length === 0 ? (
          <p>No products available. Add some!</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="p-4 border rounded-md flex justify-between items-center bg-white dark:bg-gray-800">
              <div>
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                <p className="text-lg">${product.price?.toFixed(2)}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                  <TbPencil height={3} width={3} />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                  <TbTrash height={3} width={3} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
