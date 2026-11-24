import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaBrain, FaBox, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import StatCard from '../../components/dashboard/StatCard';
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
import { formatCurrency } from '../../utils/formatters';

const STOCK_FILTERS = [
  { key: 'ALL', label: 'All Items' },
  { key: 'IN_STOCK', label: 'Healthy (25+)' },
  { key: 'LOW', label: 'Low & Critical (<25)' }
];

function SupplierProducts() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts();
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

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
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    void load();
  }, [fetchProducts]);

  useEffect(() => {
    if (!socket) return;
    socket.on('inventory:updated', fetchProducts);
    socket.on('order:created', fetchProducts);
    return () => {
      socket.off('inventory:updated', fetchProducts);
      socket.off('order:created', fetchProducts);
    };
  }, [socket, fetchProducts]);

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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query);
      const matchesFilter =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW' && p.stock < 25) ||
        (stockFilter === 'IN_STOCK' && p.stock >= 25);
      return matchesSearch && matchesFilter;
    });
  }, [products, search, stockFilter]);

  const lowStockCount = products.filter((p) => p.stock < 25).length;
  const totalValuation = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
    0
  );

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
        <p className="text-slate-500 text-sm">
          Manage your supplied catalog, adjust unit pricing, and monitor low-stock SKUs.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/supplier/forecast"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <FaBrain className="text-indigo-600" />
            Demand Forecast
          </Link>

          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <FaPlus className="text-xs" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="My Products" value={products.length} icon={<FaBox />} />
        <StatCard
          title="Low / Critical Stock"
          value={lowStockCount}
          icon={<FaExclamationTriangle />}
        />
        <StatCard
          title="Stock Valuation"
          value={formatCurrency(totalValuation)}
          icon={<FaMoneyBillWave />}
        />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search your products..."
        filters={STOCK_FILTERS}
        activeFilter={stockFilter}
        onFilterChange={setStockFilter}
        resultCount={filteredProducts.length}
      />

      <ProductTable
        products={filteredProducts}
        onEdit={(prod) => {
          setEditingProduct(prod);
          setIsModalOpen(true);
        }}
        onDelete={(prod) => setDeletingProduct(prod)}
      />

      <ProductModal
        key={editingProduct?.id || 'new-product'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleCreateOrUpdate}
        editingProduct={editingProduct}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        title="Delete Product"
        message={
          deletingProduct
            ? `Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </DashboardLayout>
  );
}

export default SupplierProducts;
