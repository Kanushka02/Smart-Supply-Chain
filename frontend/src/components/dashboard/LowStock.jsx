import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function LowStock({ products = [] }) {
  const lowStock = products.filter((p) => p.stock < 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-amber-500" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            Low Stock Alert
          </h2>
        </div>
        {lowStock.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {lowStock.length} flagged
          </span>
        )}
      </div>

      {lowStock.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 text-sm font-medium text-emerald-700">
          <FaCheckCircle className="shrink-0 text-emerald-600" />
          <span>All products have healthy stock coverage</span>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {lowStock.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-3 gap-3"
            >
              <span className="text-sm font-medium text-slate-700 truncate">
                {product.name}
              </span>
              <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {product.stock} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LowStock;
