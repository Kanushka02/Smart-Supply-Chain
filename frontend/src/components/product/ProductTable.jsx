import { FaEdit, FaTrash, FaBox } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

function getStockBadge(stock) {
  const qty = Number(stock ?? 0);
  if (qty <= 9) {
    return {
      label: 'Critical',
      classes: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500'
    };
  }
  if (qty <= 24) {
    return {
      label: 'Low Stock',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500'
    };
  }
  return {
    label: 'In Stock',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  };
}

function ProductTable({ products = [], onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
          <FaBox />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-800 mb-1">
          No matching products
        </h3>
        <p className="text-sm text-slate-500">
          Adjust your search filter or add a new product to the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[780px] w-full text-left border-collapse">
          <thead className="bg-slate-50/90 border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Product
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Supplier
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Unit Price
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Inventory Status
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const badge = getStockBadge(product.stock);
              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-11 w-11 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                      ) : (
                        <div
                          className="h-11 w-11 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-400 flex items-center justify-center shrink-0"
                          aria-label="No product image"
                        >
                          <FaBox className="text-base" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {product.name}
                          </p>
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                            SKU-{String(product.id).padStart(3, '0')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-[280px] mt-0.5">
                          {product.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className="text-xs font-medium text-slate-600">
                      {product.supplier?.companyName ||
                        product.supplier?.name ||
                        'Central Catalog'}
                    </span>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(product.price)}
                    </span>
                  </td>

                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-800 tabular-nums w-10">
                        {product.stock}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Edit product"
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => onDelete(product)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete product"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
