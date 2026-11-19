import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function ForecastChart({ forecastData }) {
  if (!forecastData) return null;

  const chartData = [
    {
      metric: 'Inventory vs Demand',
      'Current Stock': forecastData.currentStock,
      'Recent 30d Sales': forecastData.recentOrdersRecorded || 0,
      'Projected Demand': forecastData.predictedDemand,
      'Min Projected': forecastData.confidenceRange?.minDemand || forecastData.predictedDemand,
      'Max Projected': forecastData.confidenceRange?.maxDemand || forecastData.predictedDemand,
    }
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-card w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-secondary">
            Demand Forecast & Stock Analysis
          </h3>
          <p className="text-xs text-gray-500">
            Comparing available stock against machine-learning projected demand for {forecastData.productName}
          </p>
        </div>
        {forecastData.confidenceRange && (
          <div className="mt-2 sm:mt-0 text-xs font-medium text-gray-600 bg-slate-100 px-3 py-1 rounded-lg">
            Expected Range: <span className="font-bold text-secondary">{forecastData.confidenceRange.minDemand} - {forecastData.confidenceRange.maxDemand} units</span>
          </div>
        )}
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 13 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
              }}
              formatter={(value, name) => [`${value} units`, name]}
            />
            <Legend
              wrapperStyle={{ paddingTop: '15px' }}
              formatter={(value) => <span className="text-xs font-medium text-gray-700">{value}</span>}
            />
            <Bar dataKey="Current Stock" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={60} />
            <Bar dataKey="Recent 30d Sales" fill="#64748b" radius={[8, 8, 0, 0]} maxBarSize={60} />
            <Bar dataKey="Projected Demand" fill="#f97316" radius={[8, 8, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
        <div className="bg-blue-50/60 p-2.5 rounded-xl">
          <p className="text-[11px] text-blue-700 font-medium">Current Stock</p>
          <p className="text-lg font-bold text-blue-900">{forecastData.currentStock} units</p>
        </div>
        <div className="bg-orange-50/60 p-2.5 rounded-xl">
          <p className="text-[11px] text-orange-700 font-medium">Projected Next Month</p>
          <p className="text-lg font-bold text-orange-900">{forecastData.predictedDemand} units</p>
        </div>
        <div className={`p-2.5 rounded-xl ${forecastData.projectedShortage > 0 ? 'bg-rose-50/60' : 'bg-emerald-50/60'}`}>
          <p className={`text-[11px] font-medium ${forecastData.projectedShortage > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {forecastData.projectedShortage > 0 ? 'Projected Shortage' : 'Surplus Stock'}
          </p>
          <p className={`text-lg font-bold ${forecastData.projectedShortage > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
            {forecastData.projectedShortage > 0 ? `-${forecastData.projectedShortage} units` : `+${forecastData.currentStock - forecastData.predictedDemand} units`}
          </p>
        </div>
      </div>
    </div>
  );
}
