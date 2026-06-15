import {
  useEffect,
  useState
}
from 'react';

import {
  FaImage
} from 'react-icons/fa';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image: null
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

  const [previewUrl, setPreviewUrl] =
    useState(
      editingProduct?.image || ''
    );

  useEffect(() => {
    if (formData.image instanceof File) {
      const nextPreviewUrl =
        URL.createObjectURL(formData.image);

      setPreviewUrl(nextPreviewUrl);

      return () => {
        URL.revokeObjectURL(nextPreviewUrl);
      };
    }

    setPreviewUrl(formData.image || '');

    return undefined;
  }, [formData.image]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
      e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData({
      ...formData,
      image: file
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

          <label
            className="
            block
            border
            rounded-xl
            p-3
            cursor-pointer
            hover:bg-gray-50
            transition
            "
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaImage />
              Product Image
            </span>

            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
              className="mt-3 block w-full text-sm"
            />
          </label>

          {formData.image && (
            <div
              className="
              flex
              items-center
              gap-3
              rounded-xl
              bg-gray-50
              p-3
              "
            >
              <img
                src={previewUrl}
                alt={formData.name || 'Product preview'}
                className="
                h-16
                w-16
                rounded-lg
                object-cover
                bg-gray-100
                "
              />
              <span className="text-sm text-gray-600">
                {
                  formData.image instanceof File
                    ? formData.image.name
                    : 'Current product image'
                }
              </span>
            </div>
          )}

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
