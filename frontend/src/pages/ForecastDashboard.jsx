import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaBrain,
  FaBoxes,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
  FaChartLine,
  FaArrowRight,
  FaSyncAlt,
  FaRobot
} from 'react-icons/fa';

import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingState from '../components/common/LoadingState';
import StatCard from '../components/dashboard/StatCard';
import RiskBadge from '../components/forecast/RiskBadge';
import ForecastChart from '../components/forecast/ForecastChart';

import {
  getAiServiceStatus,
  getBatchForecast,
  getProductForecast
} from '../services/forecastService';
import { getProducts } from '../services/productService';

export default function ForecastDashboard() {
  const [loading, setLoading] = useState(true);
  const [aiHealth, setAiHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [products, setProducts] = useState([]);

  // Selected product deep-dive state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Fetch initial dashboard data & AI microservice status
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Health check
      try {
        const healthRes = await getAiServiceStatus();
        setAiHealth(healthRes.data?.data || healthRes.data);
      } catch (healthErr) {
        setAiHealth({ status: 'offline', model_loaded: false });
      }

      // 2. Products list for selector
      const productsRes = await getProducts();
      const productList = productsRes?.data?.data || productsRes?.data || [];
      setProducts(productList);

      // 3. Batch forecasts
      const batchRes = await getBatchForecast();
      const batchData = batchRes?.data?.data || batchRes?.data || {};
      setSummary(batchData.summary || null);
      setForecasts(batchData.forecasts || []);

      // Auto-select first product if available
      if (productList.length > 0 && !selectedProductId) {
        setSelectedProductId(productList[0].id.toString());
        await fetchSingleForecast(productList[0].id);
      }
    } catch (error) {
      console.error('Failed to load forecast dashboard:', error);
      toast.error('Unable to load demand forecasts');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleForecast = async (productId) => {
    if (!productId) return;
    setForecastLoading(true);
    try {
      const res = await getProductForecast(productId);
      const data = res?.data?.data || res?.data;
      setSelectedForecast(data);
    } catch (error) {
      console.error('Single forecast error:', error);
      if (error.response?.status === 503) {
        toast.error('AI Service is currently offline. Please start FastAPI on port 8000.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to forecast demand');
      }
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleProductSelect = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    if (id) {
      fetchSingleForecast(id);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Loading AI Demand Forecasts" />
      </DashboardLayout>
    );
  }

  const isAiOnline = aiHealth?.status === 'healthy';

  return (
    <DashboardLayout>
      {/* Header & Service Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-secondary">
              AI Demand Forecasting
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
              <FaRobot />
              Machine Learning
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Predict upcoming product demand, evaluate stockout risks, and optimize procurement schedules.
          </p>
        </div>

        {/* AI Health Badge & Refresh Button */}
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
              isAiOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isAiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            {isAiOnline
              ? 'FastAPI AI Microservice Online'
              : 'AI Service Offline (503)'}
          </div>

          <button
            onClick={loadDashboardData}
            title="Refresh Forecasts"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-gray-600 hover:text-secondary hover:border-slate-300 shadow-sm transition"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Monitored Products"
          value={summary?.totalProducts ?? products.length}
          icon={<FaBoxes className="text-primary text-xl" />}
        />
        <StatCard
          title="Total Monthly Demand"
          value={`${summary?.totalPredictedDemand ?? 0} units`}
          icon={<FaChartLine className="text-blue-500 text-xl" />}
        />
        <StatCard
          title="Potential Shortages"
          value={summary?.potentialShortagesCount ?? 0}
          icon={<FaExclamationTriangle className="text-amber-500 text-xl" />}
        />
        <StatCard
          title="Critical Shortages"
          value={summary?.criticalShortagesCount ?? 0}
          icon={<FaExclamationCircle className="text-rose-500 text-xl" />}
        />
      </div>

      {/* Deep Dive Forecast & Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Product Selection & AI Insights (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-xl text-primary">
                <FaBrain className="text-lg" />
              </div>
              <h2 className="text-lg font-bold text-secondary">
                Product Demand Deep-Dive
              </h2>
            </div>

            {/* Product Selector Dropdown */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Select Product to Forecast
              </label>
              <select
                value={selectedProductId}
                onChange={handleProductSelect}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-secondary transition"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stock} units | Rs. {p.price})
                  </option>
                ))}
              </select>
            </div>

            {forecastLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <FaSyncAlt className="animate-spin text-2xl text-primary mb-2" />
                <p className="text-xs font-medium">Running machine learning model...</p>
              </div>
            ) : selectedForecast ? (
              <div className="space-y-4">
                {/* Result Highlights */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Projected Demand (Next Month)
                      </span>
                      <h3 className="text-3xl font-extrabold text-secondary mt-1">
                        {selectedForecast.predictedDemand}{' '}
                        <span className="text-sm font-normal text-gray-500">units</span>
                      </h3>
                    </div>
                    <RiskBadge status={selectedForecast.stockStatus} />
                  </div>

                  {selectedForecast.confidenceRange && (
                    <p className="text-xs text-gray-500 mt-2">
                      Model Confidence: ±{selectedForecast.modelInfo?.mae || 14.2} units (Range:{' '}
                      <span className="font-semibold text-gray-700">
                        {selectedForecast.confidenceRange.minDemand} - {selectedForecast.confidenceRange.maxDemand}
                      </span>)
                    </p>
                  )}
                </div>

                {/* Recommendation Box */}
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    selectedForecast.stockStatus === 'CRITICAL_SHORTAGE'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : selectedForecast.stockStatus === 'POTENTIAL_SHORTAGE'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : selectedForecast.stockStatus === 'HEALTHY'
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-blue-50/80 border-blue-200 text-blue-900'
                  }`}
                >
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    {selectedForecast.stockStatus === 'HEALTHY' ? (
                      <FaCheckCircle className="text-emerald-600" />
                    ) : (
                      <FaExclamationTriangle className="text-amber-600" />
                    )}
                    AI Procurement Recommendation
                  </p>
                  <p>{selectedForecast.recommendation}</p>

                  {selectedForecast.recommendedRestock > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-black/10 flex justify-between font-bold">
                      <span>Suggested Order Quantity:</span>
                      <span>+{selectedForecast.recommendedRestock} units</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                Select a product above to generate demand prediction.
              </div>
            )}
          </div>

          {/* Model Footnote */}
          {selectedForecast?.modelInfo && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Model: {selectedForecast.modelInfo.modelType}</span>
              <span>Test MAE: {selectedForecast.modelInfo.mae} units</span>
            </div>
          )}
        </div>

        {/* Right Column: Recharts Visualization (7 cols) */}
        <div className="lg:col-span-7 flex">
          <ForecastChart forecastData={selectedForecast} />
        </div>
      </div>

      {/* Batch Products Forecast Overview Table */}
      <div className="bg-white rounded-[24px] p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
          <div>
            <h2 className="text-lg font-bold text-secondary">
              Product Demand & Inventory Status Overview
            </h2>
            <p className="text-xs text-gray-500">
              Batch predictions for all catalog products with automated risk alerts
            </p>
          </div>
          <span className="text-xs text-gray-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
            {forecasts.length} products analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-gray-500 uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Current Stock</th>
                <th className="py-3.5 px-4 font-semibold">Projected Demand</th>
                <th className="py-3.5 px-4 font-semibold">Stock Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                    No products found for demand forecasting.
                  </td>
                </tr>
              ) : (
                forecasts.map((f) => (
                  <tr
                    key={f.productId}
                    className={`hover:bg-slate-50/80 transition ${
                      selectedProductId === f.productId.toString()
                        ? 'bg-orange-50/40 font-medium'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-secondary">
                      {f.productName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      Rs. {f.price}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {f.currentStock} units
                    </td>
                    <td className="py-3.5 px-4 font-bold text-secondary">
                      {f.predictedDemand !== null ? `${f.predictedDemand} units` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge status={f.stockStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProductId(f.productId.toString());
                          fetchSingleForecast(f.productId);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition"
                      >
                        Inspect <FaArrowRight className="text-[10px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
