import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaBox, FaExclamationTriangle, FaMoneyBillWave, FaPlus } from 'react-icons/fa';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingState from '../../components/common/LoadingState';
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
import { useSocket } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/formatters';

const STOCK_FILTERS = [
  { key: 'ALL', label: 'All SKUs' },
  { key: 'IN_STOCK', label: 'Healthy (25+)' },
  { key: 'LOW', label: 'Low & Critical (<25)' }
];

function Products() {
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
      setProducts(
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    void load();
  }, [fetchProducts]);

  useEffect(() => {
    if (!socket) return;
    socket.on('inventory:updated', fetchProducts);
    return () => {
      socket.off('inventory:updated', fetchProducts);
    };
  }, [socket, fetchProducts]);

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated');
      } else {
        await createProduct(productData);
        toast.success('Product added');
      }
      fetchProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted');
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
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
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-500">
            Manage platform-wide SKUs, pricing, supplier stock levels, and product media.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0"
        >
          <FaPlus className="text-xs" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total SKUs" value={products.length} icon={<FaBox />} />
        <StatCard
          title="Low / Critical Stock"
          value={lowStockCount}
          icon={<FaExclamationTriangle />}
        />
        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(totalInventoryValue)}
          icon={<FaMoneyBillWave />}
        />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by product name or description..."
        filters={STOCK_FILTERS}
        activeFilter={stockFilter}
        onFilterChange={setStockFilter}
        resultCount={filteredProducts.length}
      />

      {loading ? (
        <LoadingState label="Loading catalog inventory" />
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={(product) => {
            setEditingProduct(product);
            setIsModalOpen(true);
          }}
          onDelete={(product) => setDeletingProduct(product)}
        />
      )}

      <ProductModal
        key={editingProduct?.id || 'new-product'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        editingProduct={editingProduct}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        title="Delete product"
        message={
          deletingProduct
            ? `Delete "${deletingProduct.name}" from the catalog? This action cannot be undone.`
            : ''
        }
        onCancel={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
}

export default Products;
