import {
  useEffect,
  useState
}
from 'react';

import toast
  from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

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

  const fetchOrders =
  async () => {

    try {
      const res =
      await getOrders();

      setOrders(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error(
        'Failed to load orders'
      );
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete =
  async (id) => {

    const confirmDelete =
      window.confirm(
        'Delete this order?'
      );

    if (!confirmDelete)
      return;

    try {
      await deleteOrder(id);

      toast.success(
        'Order Deleted'
      );

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

      <OrderTable
        orders={orders}
        onDelete={
          handleDelete
        }
      />

    </DashboardLayout>
  );
}

export default Orders;