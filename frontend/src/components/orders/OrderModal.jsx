import {
  useEffect,
  useState
}
from 'react';

import API
from '../../services/api';

function OrderModal({
  isOpen,
  onClose,
  onSave,
  userId
}) {

  const [products,
    setProducts] =
    useState([]);

  const [formData,
    setFormData] =
    useState({
      productId: '',
      quantity: ''
    });

  useEffect(() => {

    API.get('/products')
      .then(res => {

        setProducts(
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : []
        );
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      });

  }, []);

  const handleSubmit =
  (e) => {

    e.preventDefault();

    onSave({
      userId,
      productId:
      Number(
        formData.productId
      ),

      quantity:
      Number(
        formData.quantity
      )
    });

    onClose();
  };

  if (!isOpen)
    return null;

  return (

    <div
      className="
      fixed inset-0
      bg-black/50
      flex justify-center
      items-center
      z-50
      px-4
      "
    >

      <div
        className="
        bg-white
        p-6
        rounded-2xl
        w-full
        max-w-[400px]
        shadow-card
        "
      >

        <h2
          className="
          text-2xl
          font-bold
          mb-5
          "
        >
          Create Order
        </h2>

        <form
          onSubmit={
            handleSubmit
          }

          className="
          space-y-4
          "
        >

          <select
            value={
              formData.productId
            }

            onChange={(e) =>
              setFormData({
                ...formData,
                productId:
                e.target.value
              })
            }

            className="
            w-full border
            p-3 rounded-xl
            "
            required
          >

            <option value="">
              Select Product
            </option>

            {products.map(
              product => (

              <option
                key={
                  product.id
                }

                value={
                  product.id
                }
              >
                {product.name}
              </option>

            ))}

          </select>

          <input
            type="number"
            placeholder="Quantity"

            value={
              formData.quantity
            }

            onChange={(e) =>
              setFormData({
                ...formData,
                quantity:
                e.target.value
              })
            }

            className="
            w-full border
            p-3 rounded-xl
            "
            required
          />

          <button
            className="
            bg-primary
            text-white
            px-5 py-3
            rounded-xl
            hover:bg-indigo-700
            transition
            "
          >
            Create Order
          </button>

        </form>

      </div>

    </div>
  );
}

export default OrderModal;
