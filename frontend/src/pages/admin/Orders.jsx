import {
  useEffect,
  useState
}
from 'react';

import toast
  from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import ConfirmDialog
from '../../components/common/ConfirmDialog';

import LoadingState
from '../../components/common/LoadingState';

import OrderTable
from '../../components/orders/OrderTable';

import {
  getOrders,
  deleteOrder
}
from '../../services/orderService';

function Orders() {

  const [orders,
    setOrders] =
    useState([]);

  const [deletingOrderId,
    setDeletingOrderId] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const fetchOrders =
  async () => {

    try {
      const res =
      await getOrders();

      setOrders(
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []
      );
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error(
        'Failed to load orders'
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadOrders() {

      try {
        const res =
        await getOrders();

        setOrders(
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : []
        );
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error(
          'Failed to load orders'
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleDelete =
  (id) => {
    setDeletingOrderId(id);
  };

  const confirmDelete =
  async () => {
    try {
      await deleteOrder(
        deletingOrderId
      );

      toast.success(
        'Order Deleted'
      );

      setDeletingOrderId(null);

      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error(
        'Failed to delete order'
      );
    }
  };

  return (

    <DashboardLayout>

      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        Orders
      </h1>

      {loading ? (
        <LoadingState label="Loading orders" />
      ) : (
        <OrderTable
          orders={orders}
          onDelete={
            handleDelete
          }
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(
          deletingOrderId
        )}
        title="Delete order"
        message="Delete this order? This action cannot be undone."
        onCancel={() =>
          setDeletingOrderId(null)
        }
        onConfirm={
          confirmDelete
        }
      />

    </DashboardLayout>
  );
}

export default Orders;
