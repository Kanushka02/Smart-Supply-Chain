import {
  useEffect,
  useState
}
from 'react';

import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaMoneyBill
}
from 'react-icons/fa';

import {
  Oval
}
from
'react-loader-spinner';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import StatCard
from '../../components/dashboard/StatCard';

import OrdersChart
from '../../components/dashboard/OrdersChart';

import InventoryChart
from '../../components/dashboard/InventoryChart';

import LowStock
from '../../components/dashboard/LowStock';

import API
from '../../services/api';

function Dashboard() {

  const [products,
    setProducts] =
    useState([]);

  const [users,
    setUsers] =
    useState([]);

  const [orders,
    setOrders] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    async function
    fetchData() {

      setLoading(true);

      try {
        const [
          productsRes,
          usersRes,
          ordersRes
        ] = await Promise.all([
          API.get('/products'),
          API.get('/users'),
          API.get('/orders')
        ]);

        setProducts(
          productsRes?.data?.data || []
        );

        setUsers(
          usersRes?.data?.data || []
        );

        setOrders(
          ordersRes?.data?.data || []
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setProducts([]);
        setUsers([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

  }, []);

  const revenue =
  (orders || []).reduce(
    (total, order) =>
      total +
      (order.totalPrice || 0),
    0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Oval
            height={100}
            width={100}
            color="#f97316"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel='oval-loading'
            secondaryColor="#e5e7eb"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (

    <DashboardLayout>

      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        Admin Dashboard
      </h1>

      <div
        className="
        grid
        md:grid-cols-4
        gap-5
        mb-6
        "
      >

        <StatCard
          title="Products"
          value={
            products?.length || 0
          }
          icon={<FaBox />}
        />

        <StatCard
          title="Users"
          value={
            users?.length || 0
          }
          icon={<FaUsers />}
        />

        <StatCard
          title="Orders"
          value={
            orders?.length || 0
          }
          icon={
            <FaShoppingCart />
          }
        />

        <StatCard
          title="Revenue"
          value={`Rs.
          ${revenue}`}
          icon={
            <FaMoneyBill />
          }
        />

      </div>

      <div
        className="
        grid
        lg:grid-cols-2
        gap-6
        mb-6
        "
      >

        <OrdersChart
          orders={orders}
        />

        <InventoryChart
          products={
            products
          }
        />

      </div>

      <LowStock
        products={products}
      />

    </DashboardLayout>
  );
}

export default Dashboard;