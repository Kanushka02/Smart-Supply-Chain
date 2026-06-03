import {
  useEffect,
  useState
} from 'react';

import toast
  from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import ConfirmDialog
from '../../components/common/ConfirmDialog';

import LoadingState
from '../../components/common/LoadingState';

import ProductTable
from '../../components/product/ProductTable';

import ProductModal
from '../../components/product/ProductModal';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
}
from '../../services/productService';

function Products() {

  const [products, setProducts] =
    useState([]);

  const [isModalOpen,
    setIsModalOpen] =
    useState(false);

  const [editingProduct,
    setEditingProduct] =
    useState(null);

  const [deletingProduct,
    setDeletingProduct] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const fetchProducts =
    async () => {

    try {

      const res =
        await getProducts();

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
      toast.error(
        'Failed to load products'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadProducts() {
      try {

        const res =
          await getProducts();

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
        toast.error(
          'Failed to load products'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleSave =
    async (productData) => {

    try {

      if (editingProduct) {

        await updateProduct(
          editingProduct.id,
          productData
        );

        toast.success(
          'Product Updated'
        );

      } else {

        await createProduct(
          productData
        );

        toast.success(
          'Product Added'
        );
      }

      fetchProducts();

      setEditingProduct(null);

    } catch (error) {
      console.error(error);
      toast.error(
        'Something went wrong'
      );
    }
  };

  const handleDelete =
    (product) => {
    setDeletingProduct(product);
  };

  const confirmDelete =
    async () => {
    try {

      await deleteProduct(
        deletingProduct.id
      );

      toast.success(
        'Product Deleted'
      );

      setDeletingProduct(null);

      fetchProducts();

    } catch (error) {

      console.error(error);
      toast.error(
        'Failed to delete product'
      );
    }
  };

  return (

    <DashboardLayout>

      <div
        className="
        flex flex-col
        gap-4
        sm:flex-row sm:justify-between
        sm:items-center
        mb-6
        "
      >

        <h1
          className="
          text-3xl
          font-bold
          "
        >
          Products
        </h1>

        <button
          onClick={() =>
            setIsModalOpen(true)
          }

          className="
          bg-primary
          text-white
          px-5 py-3
          rounded-xl
          hover:bg-orange-600
          transition
          w-full
          sm:w-auto
          "
        >
          Add Product
        </button>

      </div>

      {loading ? (
        <LoadingState label="Loading products" />
      ) : (
        <ProductTable
          products={products || []}
          onEdit={(product) => {

            setEditingProduct(
              product
            );

            setIsModalOpen(true);
          }}

          onDelete={
            handleDelete
          }
        />
      )}

      <ProductModal
        key={
          editingProduct?.id || 'new-product'
        }
        isOpen={
          isModalOpen
        }

        onClose={() => {

          setIsModalOpen(false);

          setEditingProduct(
            null
          );
        }}

        onSave={
          handleSave
        }

        editingProduct={
          editingProduct
        }
      />

      <ConfirmDialog
        isOpen={Boolean(
          deletingProduct
        )}
        title="Delete product"
        message={`Delete ${deletingProduct?.name || 'this product'}? This action cannot be undone.`}
        onCancel={() =>
          setDeletingProduct(null)
        }
        onConfirm={
          confirmDelete
        }
      />

    </DashboardLayout>
  );
}

export default Products;
