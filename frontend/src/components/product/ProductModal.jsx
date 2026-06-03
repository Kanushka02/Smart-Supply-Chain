import { useState }
from 'react';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  stock: ''
};

function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct
}) {

  const [formData, setFormData] =
    useState(
      editingProduct || emptyProduct
    );

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
      e.target.value
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    onSave(formData);

    onClose();
  };

  if (!isOpen) return null;

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
        rounded-2xl
        p-6
        w-full
        max-w-[450px]
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
          {
            editingProduct
            ? 'Edit Product'
            : 'Add Product'
          }
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="
            w-full
            border
            rounded-xl
            p-3
            "
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={
              formData.description
            }
            onChange={handleChange}
            className="
            w-full
            border
            rounded-xl
            p-3
            "
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="
            w-full
            border
            rounded-xl
            p-3
            "
            required
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            className="
            w-full
            border
            rounded-xl
            p-3
            "
            required
          />

          <div className="flex gap-3">

            <button
              className="
              bg-primary
              text-white
              px-5 py-3
              rounded-xl
              hover:bg-orange-600
              transition
              "
            >
              Save
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
              bg-gray-300
              px-5 py-3
              rounded-xl
              hover:bg-gray-400
              transition
              "
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ProductModal;
