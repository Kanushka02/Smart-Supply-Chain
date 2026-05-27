import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Dashboard
from './pages/admin/Dashboard/Dashboard';

import Products
from './pages/admin/Products/Products';

import Orders
from './pages/admin/Orders/Orders';

import Users
from './pages/admin/Users/Users';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/users"
          element={<Users />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;