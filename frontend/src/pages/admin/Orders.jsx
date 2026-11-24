import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaShoppingCart, FaBoxes, FaMoneyBillWave } from 'react-icons/fa';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingState from '../../components/common/LoadingState';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import StatCard from '../../components/dashboard/StatCard';
import OrderTable from '../../components/orders/OrderTable';

import { getOrders, deleteOrder } from '../../services/orderService';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/formatters';

function Orders() {
  const { socket } = useSocket();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []
      );
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const confirmDelete = async () => {
    try {
      await deleteOrder(deletingOrderId);
      toast.success('Order deleted');
      setDeletingOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(
      (o) =>
        o.user?.name?.toLowerCase().includes(query) ||
        o.user?.email?.toLowerCase().includes(query) ||
        o.product?.name?.toLowerCase().includes(query) ||
        `ord-${String(o.id).padStart(4, '0')}`.includes(query)
    );
  }, [orders, search]);

  const totalUnits = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  return (
    <DashboardLayout>
      <p className="text-sm text-slate-500 mb-6">
        Audit platform-wide purchase orders, real-time stock deductions, and supplier fulfillment volume.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={<FaShoppingCart />}
        />
        <StatCard
          title="Total Units Ordered"
          value={totalUnits}
          icon={<FaBoxes />}
        />
        <StatCard
          title="Gross Order Volume"
          value={formatCurrency(totalRevenue)}
          icon={<FaMoneyBillWave />}
        />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by order ID, supplier, or product..."
        resultCount={filteredOrders.length}
      />

      {loading ? (
        <LoadingState label="Loading order ledger" />
      ) : (
        <OrderTable
          orders={filteredOrders}
          onDelete={(id) => setDeletingOrderId(id)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingOrderId)}
        title="Delete order"
        message="Delete this order record? This action cannot be undone."
        onCancel={() => setDeletingOrderId(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
}

export default Orders;
