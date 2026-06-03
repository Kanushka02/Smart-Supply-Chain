import {
  useEffect,
  useState
}
from 'react';

import toast
from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import LoadingState
from '../../components/common/LoadingState';

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
from '../../context/useAuth';

function Orders() {

  const { user } =
    useAuth();

  const [orders,
    setOrders] =
    useState([]);

  const [isOpen,
    setIsOpen] =
    useState(false);

  const [loading,
    setLoading] =
    useState(true);

  const fetchOrders =
  async () => {

    try {
      const res =
        await getSupplierOrders(
          user.id
        );

      // Handle wrapped response format from successResponse
      const ordersData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setOrders(ordersData);
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
          await getSupplierOrders(
            user.id
          );

        // Handle wrapped response format from successResponse
        const ordersData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        setOrders(ordersData);
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
  }, [user.id]);

  const handleSave =
  async (data) => {

    try {
      await createOrder(
        data
      );

      toast.success(
        'Order Created'
      );

      fetchOrders();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(
        'Failed to create order'
      );
    }
  };

  return (

    <DashboardLayout>

      <div
        className="
        flex flex-col
        gap-4
        sm:flex-row sm:justify-between
        sm:items-center
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
          bg-primary
          text-white
          px-5 py-3
          rounded-xl
          hover:bg-orange-600
          transition
          w-full
          sm:w-auto
          "
        >
          Add Order
        </button>

      </div>

      {loading ? (
        <LoadingState label="Loading orders" />
      ) : (
        <OrderTable
          orders={orders}
        />
      )}

      <OrderModal
        key={
          isOpen ? 'create-order-open' : 'create-order-closed'
        }
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
