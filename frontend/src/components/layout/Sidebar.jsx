import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTimes,
  FaBrain,
  FaBell
} from 'react-icons/fa';

import { useAuth } from '../../context/useAuth';

function Sidebar({ onClose }) {
  const { user } = useAuth();

  const adminMenu = [
    { name: 'Overview', path: '/admin', exact: true, icon: <FaHome /> },
    { name: 'Products', path: '/admin/products', icon: <FaBox /> },
    { name: 'Orders', path: '/admin/orders', icon: <FaShoppingCart /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'AI Forecast', path: '/admin/forecast', icon: <FaBrain /> },
    { name: 'Notifications', path: '/notifications', icon: <FaBell /> }
  ];

  const supplierMenu = [
    { name: 'Overview', path: '/supplier', exact: true, icon: <FaHome /> },
    { name: 'My Products', path: '/supplier/products', icon: <FaBox /> },
    { name: 'Orders', path: '/supplier/orders', icon: <FaShoppingCart /> },
    { name: 'AI Forecast', path: '/supplier/forecast', icon: <FaBrain /> },
    { name: 'Notifications', path: '/notifications', icon: <FaBell /> }
  ];

  const menu = user?.role === 'ADMIN' ? adminMenu : supplierMenu;

  return (
    <aside className="bg-slate-950 text-white w-64 min-h-screen flex flex-col justify-between p-5 relative border-r border-slate-800/80">
      <div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="lg:hidden absolute right-4 top-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Brand Identity */}
        <div className="flex items-center gap-3 px-1 mb-8 mt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold tracking-tight text-white">
                SmartChain
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {user?.role === 'ADMIN' ? 'Admin Console' : 'Supplier Portal'}
            </p>
          </div>
        </div>

        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={Boolean(item.exact)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              <span className="text-base opacity-90">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-6 border-t border-slate-800/80">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3">
          <p className="text-xs font-semibold text-slate-200 truncate">
            {user?.companyName || user?.name || 'SmartChain Workspace'}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {user?.email || 'Authenticated Session'}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
