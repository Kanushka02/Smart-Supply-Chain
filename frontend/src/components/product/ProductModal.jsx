import { useEffect, useMemo, useState } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image: null
};

function ProductModal({ isOpen, onClose, onSave, editingProduct }) {
  const [formData, setFormData] = useState(editingProduct || emptyProduct);

  const previewUrl = useMemo(() => {
    if (formData.image instanceof File) {
      return URL.createObjectURL(formData.image);
    }
    return formData.image || '';
  }, [formData.image]);

  useEffect(() => {
    if (formData.image instanceof File && previewUrl) {
      return () => URL.revokeObjectURL(previewUrl);
    }
    return undefined;
  }, [formData.image, previewUrl]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex justify-center items-center z-50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-[480px] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Ceylon Alba Cinnamon (1kg)"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Packaging details, specifications, or notes..."
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                Unit Price (Rs.) *
              </label>
              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                placeholder="4800"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                placeholder="50"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block border border-dashed border-slate-300 bg-slate-50/70 rounded-xl p-3.5 cursor-pointer hover:bg-slate-100/70 transition">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <FaImage className="text-indigo-600" />
                Product Image (Optional · PNG/JPG)
              </span>
              <input
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                className="mt-2.5 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </label>
          </div>

          {formData.image && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-2.5">
              <img
                src={previewUrl}
                alt={formData.name || 'Product preview'}
                className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-white"
              />
              <span className="text-xs font-medium text-slate-600 truncate">
                {formData.image instanceof File
                  ? formData.image.name
                  : 'Current product image'}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
