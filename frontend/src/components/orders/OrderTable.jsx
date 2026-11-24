import { FaTrash, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import { formatCurrency, formatDate, getInitials } from '../../utils/formatters';

function OrderTable({ orders = [], onDelete }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
          <FaShoppingCart />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-800 mb-1">
          No orders found
        </h3>
        <p className="text-sm text-slate-500">
          Orders placed by suppliers will appear here in real time.
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
                Order ID
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Buyer / Supplier
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Product
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Quantity
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Amount
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">
                {onDelete ? 'Actions' : 'Status'}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-3.5 px-5">
                  <span className="inline-block font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    #ORD-{String(order.id).padStart(4, '0')}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </td>

                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {getInitials(order.user?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {order.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {order.user?.email || '—'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-5">
                  <p className="text-sm font-medium text-slate-800">
                    {order.product?.name || 'Deleted Product'}
                  </p>
                  {order.product?.price != null && (
                    <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                      {formatCurrency(order.product.price)} / unit
                    </p>
                  )}
                </td>

                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 tabular-nums">
                    {order.quantity} units
                  </span>
                </td>

                <td className="py-3.5 px-5">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </td>

                <td className="py-3.5 px-5 text-right">
                  {onDelete ? (
                    <button
                      type="button"
                      aria-label={`Delete order ${order.id}`}
                      onClick={() => onDelete(order.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete order"
                    >
                      <FaTrash />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <FaCheckCircle className="text-[10px]" />
                      Confirmed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;
