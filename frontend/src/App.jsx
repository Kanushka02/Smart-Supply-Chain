import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { useAuth }
from './context/useAuth';

import ProtectedRoute
from './routes/ProtectedRoute';

import Login
from './pages/Login';

import Register
from './pages/Register';

import Notifications
from './pages/Notifications';

// ADMIN
import AdminDashboard
from './pages/admin/Dashboard';

import AdminProducts
from './pages/admin/Products';

import AdminOrders
from './pages/admin/Orders';

import AdminUsers
from './pages/admin/Users';

// SUPPLIER
import SupplierDashboard
from './pages/supplier/Dashboard';

import SupplierProducts
from './pages/supplier/Products';

import SupplierOrders
from './pages/supplier/Orders';

function App() {

  const {
    user,
    loading
  } = useAuth();

  if (loading)
    return null;

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DEFAULT REDIRECT */}

        <Route
          path="/"
          element={

            user ? (

              user.role
              === 'ADMIN'

              ? (
                <Navigate
                  to="/admin"
                />
              )

              : (
                <Navigate
                  to="/supplier"
                />
              )

            ) : (

              <Navigate
                to="/login"
              />

            )
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"

          element={
            <ProtectedRoute
              role="ADMIN"
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"

          element={
            <ProtectedRoute
              role="ADMIN"
            >
              <AdminProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"

          element={
            <ProtectedRoute
              role="ADMIN"
            >
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"

          element={
            <ProtectedRoute
              role="ADMIN"
            >
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* SUPPLIER */}

        <Route
          path="/supplier"

          element={
            <ProtectedRoute
              role="SUPPLIER"
            >
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/products"

          element={
            <ProtectedRoute
              role="SUPPLIER"
            >
              <SupplierProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/orders"

          element={
            <ProtectedRoute
              role="SUPPLIER"
            >
              <SupplierOrders />
            </ProtectedRoute>
          }
        />

        {/* NOTIFICATIONS */}

        <Route
          path="/notifications"

          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;