import {
  useEffect,
  useState
}
from 'react';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import StatCard
from '../../components/dashboard/StatCard';

import SalesChart
from '../../components/dashboard/SalesChart';

import {
  getProducts,
  getUsers,
  getOrders
}
from '../../services/dashboardService';

function Dashboard() {

  const [stats,
    setStats] =
    useState({
      products: 0,
      users: 0,
      orders: 0
    });

  useEffect(() => {

    async function
    fetchStats() {

      try {

        const [
          productsRes,
          usersRes,
          ordersRes
        ] = await Promise.all([
          getProducts(),
          getUsers(),
          getOrders()
        ]);

        const products = Array.isArray(productsRes.data) 
          ? productsRes.data 
          : [];
        const users = Array.isArray(usersRes.data) 
          ? usersRes.data 
          : [];
        const orders = Array.isArray(ordersRes.data) 
          ? ordersRes.data 
          : [];

        setStats({
          products:
          products.length,

          users:
          users.length,

          orders:
          orders.length
        });

      } catch (error) {

        console.error('Failed to fetch stats:', error);
        setStats({
          products: 0,
          users: 0,
          orders: 0
        });
      }
    }

    fetchStats();

  }, []);

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
        md:grid-cols-3
        gap-5
        mb-6
        "
      >

        <StatCard
          title="Products"
          value={
            stats.products
          }
        />

        <StatCard
          title="Users"
          value={
            stats.users
          }
        />

        <StatCard
          title="Orders"
          value={
            stats.orders
          }
        />

      </div>

      <SalesChart />

    </DashboardLayout>
  );
}

export default Dashboard;