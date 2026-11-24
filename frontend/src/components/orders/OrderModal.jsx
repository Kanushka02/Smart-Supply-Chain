import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import API from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

function OrderModal({ isOpen, onClose, onSave, userId }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: ''
  });

  useEffect(() => {
    API.get('/products')
      .then((res) => {
        setProducts(
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : []
        );
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      });
  }, []);

  const selectedProduct = products.find(
    (p) => String(p.id) === String(formData.productId)
  );
  const qtyNum = Number(formData.quantity || 0);
  const estimatedTotal = selectedProduct ? selectedProduct.price * qtyNum : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      userId,
      productId: Number(formData.productId),
      quantity: Number(formData.quantity)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex justify-center items-center z-50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-[440px] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Place Purchase Order
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
              Select Product *
            </label>
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, productId: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              required
            >
              <option value="">Choose a catalog item...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock} in stock ·{' '}
                  {formatCurrency(product.price)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              placeholder="Enter units to order"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quantity: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              required
            />
          </div>

          {selectedProduct && qtyNum > 0 && (
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-700">
                  Estimated Order Total
                </p>
                <p className="text-[11px] text-indigo-500">
                  Available stock: {selectedProduct.stock} units
                </p>
              </div>
              <span className="font-display text-lg font-bold text-indigo-900 tabular-nums">
                {formatCurrency(estimatedTotal)}
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
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderModal;
