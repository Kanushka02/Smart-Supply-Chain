import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function OrdersChart({ orders = [] }) {
  const monthlyData = MONTHS.map((month) => ({
    month,
    orders: 0
  }));

  orders.forEach((order) => {
    const monthIndex = new Date(order.createdAt).getMonth();
    if (!Number.isNaN(monthIndex) && monthlyData[monthIndex]) {
      monthlyData[monthIndex].orders += 1;
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card h-[360px] min-w-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Orders Trend
          </h2>
          <p className="text-xs text-slate-500">
            Monthly purchase order volume
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: '#ffffff',
                stroke: '#4f46e5'
              }}
              activeDot={{ r: 6, fill: '#4f46e5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OrdersChart;
