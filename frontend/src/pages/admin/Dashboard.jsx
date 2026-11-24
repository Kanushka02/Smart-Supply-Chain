import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaMoneyBill,
  FaBrain,
  FaArrowRight
} from 'react-icons/fa';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import StatCard from '../../components/dashboard/StatCard';
import OrdersChart from '../../components/dashboard/OrdersChart';
import InventoryChart from '../../components/dashboard/InventoryChart';
import LowStock from '../../components/dashboard/LowStock';

import API from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/formatters';

function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        API.get('/products'),
        API.get('/users'),
        API.get('/orders')
      ]);

      setProducts(productsRes?.data?.data || productsRes?.data || []);
      setUsers(usersRes?.data?.data || usersRes?.data || []);
      setOrders(ordersRes?.data?.data || ordersRes?.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setProducts([]);
      setUsers([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    socket.on('dashboard:updated', fetchData);

    return () => {
      socket.off('order:created', fetchData);
      socket.off('inventory:updated', fetchData);
      socket.off('dashboard:updated', fetchData);
    };
  }, [socket, fetchData]);

  const revenue = (orders || []).reduce(
    (total, order) => total + (order.totalPrice || 0),
    0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Loading executive overview" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Welcome back, {user?.name || 'Admin'}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Monitor platform-wide stock, revenue, and AI forecasting health.
          </p>
        </div>

        <Link
          to="/admin/forecast"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition w-fit shrink-0"
        >
          <FaBrain />
          AI Demand Forecasts
          <FaArrowRight className="text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Catalog SKUs"
          value={products?.length || 0}
          icon={<FaBox />}
        />
        <StatCard
          title="Active Accounts"
          value={users?.length || 0}
          icon={<FaUsers />}
        />
        <StatCard
          title="Total Orders"
          value={orders?.length || 0}
          icon={<FaShoppingCart />}
        />
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(revenue)}
          icon={<FaMoneyBill />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart orders={orders} />
        <InventoryChart products={products} />
      </div>

      <LowStock products={products} />
    </DashboardLayout>
  );
}

export default Dashboard;
