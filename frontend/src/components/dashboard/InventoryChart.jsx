import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FaBoxes } from 'react-icons/fa';

function InventoryChart({ products = [] }) {
  const chartData = products.slice(0, 8).map((product) => ({
    name:
      product.name?.length > 14
        ? `${product.name.slice(0, 12)}...`
        : product.name,
    stock: product.stock
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card h-[360px] min-w-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Inventory Stock Levels
          </h2>
          <p className="text-xs text-slate-500">
            Available units across catalog items
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200 p-6">
          <FaBoxes className="text-3xl text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">
            No inventory items yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Add products to visualize real-time warehouse stock levels.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="stock"
                name="Units in Stock"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default InventoryChart;
