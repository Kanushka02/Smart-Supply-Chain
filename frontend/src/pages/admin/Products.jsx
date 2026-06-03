import {
  useEffect,
  useState
} from 'react';

import toast
  from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

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
    }
  };

  useEffect(() => {
    fetchProducts();
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
    async (id) => {

    const confirmDelete =
      window.confirm(
        'Delete this product?'
      );

    if (!confirmDelete)
      return;

    try {

      await deleteProduct(id);

      toast.success(
        'Product Deleted'
      );

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
        flex justify-between
        items-center mb-6
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
          "
        >
          Add Product
        </button>

      </div>

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

      <ProductModal
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

    </DashboardLayout>
  );
}

export default Products;