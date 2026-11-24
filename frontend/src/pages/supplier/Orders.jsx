import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaShoppingCart, FaBoxes, FaMoneyBillWave } from 'react-icons/fa';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingState from '../../components/common/LoadingState';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import StatCard from '../../components/dashboard/StatCard';
import OrderTable from '../../components/orders/OrderTable';
import OrderModal from '../../components/orders/OrderModal';

import { getSupplierOrders, createOrder } from '../../services/orderService';
import { useAuth } from '../../context/useAuth';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/formatters';

function Orders() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getSupplierOrders(userId);
      const ordersData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      await fetchOrders();
    };
    void load();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:created', fetchOrders);
    return () => {
      socket.off('order:created', fetchOrders);
    };
  }, [socket, fetchOrders]);

  const handleSave = async (data) => {
    try {
      await createOrder(data);
      toast.success('Order placed atomically & inventory updated');
      fetchOrders();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(
      (o) =>
        o.product?.name?.toLowerCase().includes(query) ||
        `ord-${String(o.id).padStart(4, '0')}`.includes(query)
    );
  }, [orders, search]);

  const totalUnits = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalValue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-sm text-slate-500">
          Place purchase orders with real-time stock validation and track historical fulfillment.
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0"
        >
          <FaPlus className="text-xs" />
          New Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="My Orders" value={orders.length} icon={<FaShoppingCart />} />
        <StatCard title="Units Ordered" value={totalUnits} icon={<FaBoxes />} />
        <StatCard
          title="Total Spend"
          value={formatCurrency(totalValue)}
          icon={<FaMoneyBillWave />}
        />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by order ID or product name..."
        resultCount={filteredOrders.length}
      />

      {loading ? (
        <LoadingState label="Loading your orders" />
      ) : (
        <OrderTable orders={filteredOrders} />
      )}

      <OrderModal
        key={isOpen ? 'create-order-open' : 'create-order-closed'}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        userId={user.id}
      />
    </DashboardLayout>
  );
}

export default Orders;
