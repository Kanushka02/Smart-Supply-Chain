import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTimes,
  FaBrain
} from 'react-icons/fa';

import { useAuth } from '../../context/useAuth';

function Sidebar({ onClose }) {
  const { user } = useAuth();

  const adminMenu = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <FaHome />
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <FaBox />
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <FaShoppingCart />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <FaUsers />
    },
    {
      name: 'AI Forecast',
      path: '/admin/forecast',
      icon: <FaBrain />
    }
  ];

  const supplierMenu = [
    {
      name: 'Dashboard',
      path: '/supplier',
      icon: <FaHome />
    },
    {
      name: 'My Products',
      path: '/supplier/products',
      icon: <FaBox />
    },
    {
      name: 'Orders',
      path: '/supplier/orders',
      icon: <FaShoppingCart />
    },
    {
      name: 'AI Forecast',
      path: '/supplier/forecast',
      icon: <FaBrain />
    }
  ];

  const menu = user?.role === 'ADMIN' ? adminMenu : supplierMenu;

  return (
    <div className="bg-secondary text-white w-64 min-h-screen p-5 relative shadow-card">
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="lg:hidden absolute right-5 top-5 text-2xl hover:text-orange-400 transition"
      >
        <FaTimes />
      </button>

      <h1 className="text-2xl font-bold text-primary mb-10 mt-8 lg:mt-0">
        Supply Chain
      </h1>

      <nav className="space-y-3">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition font-medium ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`
            }
            onClick={() => {
              if (onClose) onClose();
            }}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
