import {
  useEffect,
  useState
}
from 'react';

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
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete =
  async (id) => {

    try {
      await deleteOrder(id);

      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
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