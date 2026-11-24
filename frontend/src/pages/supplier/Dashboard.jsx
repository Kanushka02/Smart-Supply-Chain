import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBox,
  FaShoppingCart,
  FaMoneyBill,
  FaBrain,
  FaArrowRight,
  FaExclamationTriangle
} from 'react-icons/fa';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatCard from '../../components/dashboard/StatCard';
import OrdersChart from '../../components/dashboard/OrdersChart';
import InventoryChart from '../../components/dashboard/InventoryChart';
import LowStock from '../../components/dashboard/LowStock';
import RiskBadge from '../../components/forecast/RiskBadge';

import API from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/formatters';

function SupplierDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const userId = user?.id;

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [forecastSummary, setForecastSummary] = useState(null);
  const [topForecasts, setTopForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, ordersRes, forecastRes] = await Promise.all([
        API.get('/products'),
        API.get('/orders'),
        API.get('/forecast').catch(() => null)
      ]);

      const allProducts = productsRes?.data?.data || productsRes?.data || [];
      const supplierProducts = allProducts.filter(
        (p) => !p.supplierId || p.supplierId === userId
      );

      const supplierOrders = ordersRes?.data?.data || ordersRes?.data || [];

      setProducts(supplierProducts);
      setOrders(supplierOrders);

      if (forecastRes?.data?.data) {
        setForecastSummary(forecastRes.data.data.summary || null);
        setTopForecasts(forecastRes.data.data.forecasts?.slice(0, 4) || []);
      }
    } catch (error) {
      console.error('Failed to fetch supplier dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    void load();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:created', fetchData);
    socket.on('inventory:updated', fetchData);

    return () => {
      socket.off('order:created', fetchData);
      socket.off('inventory:updated', fetchData);
    };
  }, [socket, fetchData]);

  const totalRevenue = (orders || []).reduce(
    (sum, o) => sum + (o.totalPrice || 0),
    0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Loading Supplier Portal" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-slate-500 text-sm">
          Welcome back,{' '}
          <span className="font-semibold text-slate-900">{user?.name}</span>.
          Monitor your catalog, incoming orders, and AI inventory forecasts.
        </p>

        <Link
          to="/supplier/forecast"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition w-fit"
        >
          <FaBrain />
          AI Demand Forecasts
          <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="My Products" value={products.length} icon={<FaBox />} />
        <StatCard
          title="Orders Placed"
          value={orders.length}
          icon={<FaShoppingCart />}
        />
        <StatCard
          title="Total Sales Value"
          value={formatCurrency(totalRevenue)}
          icon={<FaMoneyBill />}
        />
        <StatCard
          title="Critical Shortages"
          value={forecastSummary?.criticalShortagesCount ?? 0}
          icon={<FaExclamationTriangle className="text-rose-500" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart orders={orders} />
        <InventoryChart products={products} />
      </div>

      {/* AI Demand Forecast Spotlight & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                  <FaBrain />
                </div>
                <h3 className="font-display font-bold text-slate-900">
                  AI Demand Spotlight
                </h3>
              </div>
              <Link
                to="/supplier/forecast"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View All
              </Link>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Machine learning projected monthly demand for your top catalog items.
            </p>

            <div className="space-y-2.5">
              {topForecasts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No forecast predictions currently available.
                </p>
              ) : (
                topForecasts.map((f) => (
                  <div
                    key={f.productId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {f.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Stock: {f.currentStock} · Projected:{' '}
                        {f.predictedDemand || 'N/A'} units
                      </p>
                    </div>
                    <RiskBadge status={f.stockStatus} />
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/supplier/forecast"
            className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            Launch Full Forecast Engine <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <LowStock products={products} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SupplierDashboard;
