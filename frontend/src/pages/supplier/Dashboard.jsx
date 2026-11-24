import { useEffect, useState } from 'react';
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

function SupplierDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [forecastSummary, setForecastSummary] = useState(null);
  const [topForecasts, setTopForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, forecastRes] = await Promise.all([
        API.get('/products'),
        API.get('/orders'),
        API.get('/forecast').catch(() => null)
      ]);

      const allProducts = productsRes?.data?.data || productsRes?.data || [];
      // Filter products belonging to current supplier (or unassigned demo products)
      const supplierProducts = allProducts.filter(
        (p) => !p.supplierId || p.supplierId === user?.id
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
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      fetchData();
    };

    socket.on('order:created', handleRefresh);
    socket.on('inventory:updated', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('inventory:updated', handleRefresh);
    };
  }, [socket]);

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
        <div>
          <h1 className="text-3xl font-bold text-secondary">
            Supplier Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-secondary">{user?.name}</span>. Monitor your products, incoming orders, and AI inventory forecasts.
          </p>
        </div>

        <Link
          to="/supplier/forecast"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition w-fit"
        >
          <FaBrain />
          AI Demand Forecasts
          <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="My Products"
          value={products.length}
          icon={<FaBox className="text-primary text-xl" />}
        />
        <StatCard
          title="Orders Placed"
          value={orders.length}
          icon={<FaShoppingCart className="text-blue-500 text-xl" />}
        />
        <StatCard
          title="Total Sales Value"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          icon={<FaMoneyBill className="text-emerald-500 text-xl" />}
        />
        <StatCard
          title="Critical Shortages"
          value={forecastSummary?.criticalShortagesCount ?? 0}
          icon={<FaExclamationTriangle className="text-rose-500 text-xl" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart orders={orders} />
        <InventoryChart products={products} />
      </div>

      {/* AI Demand Forecast Spotlight & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Spotlight (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-xl text-primary">
                  <FaBrain />
                </div>
                <h3 className="font-bold text-secondary">
                  AI Demand Forecast Spotlight
                </h3>
              </div>
              <Link
                to="/supplier/forecast"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Machine learning projected monthly demand for your top inventory items.
            </p>

            <div className="space-y-3">
              {topForecasts.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No forecast predictions currently available.
                </p>
              ) : (
                topForecasts.map((f) => (
                  <div
                    key={f.productId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-secondary">
                        {f.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {f.currentStock} | Projected: {f.predictedDemand || 'N/A'} units
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
            className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-secondary text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            Launch Full Forecast Engine <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Low Stock Alerts (7 cols) */}
        <div className="lg:col-span-7">
          <LowStock products={products} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SupplierDashboard;
