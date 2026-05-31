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

    const res =
    await getOrders();

    setOrders(
      res.data
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete =
  async (id) => {

    await deleteOrder(id);

    fetchOrders();
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