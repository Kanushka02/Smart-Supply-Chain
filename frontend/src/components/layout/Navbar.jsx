import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';

import { useAuth } from '../../context/useAuth';
import NotificationDropdown from '../common/NotificationDropdown';

const PAGE_TITLES = {
  '/admin': 'Executive Overview',
  '/admin/products': 'Catalog & Inventory',
  '/admin/orders': 'Order Fulfillment',
  '/admin/users': 'User Administration',
  '/admin/forecast': 'AI Demand Forecasting',
  '/supplier': 'Supplier Overview',
  '/supplier/products': 'My Product Catalog',
  '/supplier/orders': 'Purchase Orders',
  '/supplier/forecast': 'AI Demand Forecasting',
  '/notifications': 'Notifications Center'
};

function getInitials(name) {
  if (!name) return 'U';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Navbar({ onMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex justify-between items-center sticky top-0 z-30 border-b border-slate-200/80">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuOpen && (
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open sidebar"
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <FaBars />
          </button>
        )}

        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationDropdown />

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800 leading-none">
              {user?.name || 'User'}
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {user?.role || 'USER'}
            </span>
          </div>

          <div
            title={user?.name}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-xs font-bold flex items-center justify-center shadow-sm"
          >
            {getInitials(user?.name)}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
        >
          <FaSignOutAlt />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
