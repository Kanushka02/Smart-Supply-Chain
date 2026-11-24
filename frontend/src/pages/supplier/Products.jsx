import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaBrain } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductTable from '../../components/product/ProductTable';
import ProductModal from '../../components/product/ProductModal';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../services/productService';
import { useAuth } from '../../context/useAuth';
import { useSocket } from '../../context/SocketContext';

function SupplierProducts() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      // Filter products belonging to current supplier (or unassigned demo products)
      const supplierList = list.filter(
        (p) => !p.supplierId || p.supplierId === user?.id
      );

      setProducts(supplierList);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleProductRefresh = () => {
      fetchProducts();
    };

    socket.on('inventory:updated', handleProductRefresh);
    socket.on('order:created', handleProductRefresh);

    return () => {
      socket.off('inventory:updated', handleProductRefresh);
      socket.off('order:created', handleProductRefresh);
    };
  }, [socket]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Save product error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Loading your product inventory" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your catalog, update inventory counts, and review pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/supplier/forecast"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-secondary hover:border-slate-300 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <FaBrain className="text-primary" />
            Demand Forecast
          </Link>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition"
          >
            <FaPlus className="text-xs" />
            Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-card">
        <ProductTable
          products={products}
          onEdit={(prod) => {
            setEditingProduct(prod);
            setIsModalOpen(true);
          }}
          onDelete={(prod) => setDeletingProduct(prod)}
        />
      </div>

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleCreateOrUpdate}
          product={editingProduct}
        />
      )}

      {deletingProduct && (
        <ConfirmDialog
          isOpen={Boolean(deletingProduct)}
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default SupplierProducts;
