import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { useAuth }
from './context/AuthContext';

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

  const { user } =
    useAuth();

  return (
    <BrowserRouter>

      <Routes>

        {/* Default Redirect */}

        <Route
          path="/"
          element={
            user.role === 'ADMIN'
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
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* SUPPLIER */}

        <Route
          path="/supplier"
          element={<SupplierDashboard />}
        />

        <Route
          path="/supplier/products"
          element={<SupplierProducts />}
        />

        <Route
          path="/supplier/orders"
          element={<SupplierOrders />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;