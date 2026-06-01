import {
  useEffect,
  useState
}
from 'react';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import OrderTable
from '../../components/orders/OrderTable';

import OrderModal
from '../../components/orders/OrderModal';

import {
  getSupplierOrders,
  createOrder
}
from '../../services/orderService';

import {
  useAuth
}
from '../../context/AuthContext';

function Orders() {

  const { user } =
    useAuth();

  const [orders,
    setOrders] =
    useState([]);

  const [isOpen,
    setIsOpen] =
    useState(false);

  const fetchOrders =
  async () => {

    const res =
      await getSupplierOrders(
        user.id
      );

    setOrders(
      res.data.data
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSave =
  async (data) => {

    await createOrder(
      data
    );

    fetchOrders();
  };

  return (

    <DashboardLayout>

      <div
        className="
        flex justify-between
        mb-6
        "
      >

        <h1
          className="
          text-3xl
          font-bold
          "
        >
          My Orders
        </h1>

        <button
          onClick={() =>
            setIsOpen(true)
          }

          className="
          bg-orange-500
          text-white
          px-5 py-3
          rounded-xl
          "
        >
          Add Order
        </button>

      </div>

      <OrderTable
        orders={orders}
      />

      <OrderModal
        isOpen={isOpen}
        onClose={() =>
          setIsOpen(false)
        }

        onSave={
          handleSave
        }

        userId={user.id}
      />

    </DashboardLayout>
  );
}

export default Orders;