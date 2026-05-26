import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Dashboard
from './pages/Dashboard/Dashboard';

import Products
from './pages/Products/Products';

import Orders
from './pages/Orders/Orders';

import Users
from './pages/Users/Users';

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