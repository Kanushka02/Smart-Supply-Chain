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
          res.data || []
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
      "
    >

      <div
        className="
        bg-white
        p-6
        rounded-2xl
        w-[400px]
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
          >

            <option>
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
          />

          <button
            className="
            bg-orange-500
            text-white
            px-5 py-3
            rounded-xl
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