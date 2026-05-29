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

        setStats({
          products:
          productsRes.data.data
          .length,

          users:
          usersRes.data.data
          .length,

          orders:
          ordersRes.data.data
          .length
        });

      } catch (error) {

        console.error(error);
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