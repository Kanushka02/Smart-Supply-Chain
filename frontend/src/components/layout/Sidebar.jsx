import { NavLink } from 'react-router-dom';

import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers
} from 'react-icons/fa';

function Sidebar() {

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <FaHome />
    },

    {
      name: 'Products',
      path: '/products',
      icon: <FaBox />
    },

    {
      name: 'Orders',
      path: '/orders',
      icon: <FaShoppingCart />
    },

    {
      name: 'Users',
      path: '/users',
      icon: <FaUsers />
    }
  ];

  return (
    <div
      className="
      bg-stone-900
      text-white
      w-64
      min-h-screen
      p-5
      hidden
      md:block
      "
    >

      <h1
        className="
        text-2xl
        font-bold
        mb-10
        text-orange-400
        "
      >
        Supply Chain
      </h1>

      <nav className="space-y-3">

        {menuItems.map((item) => (

          <NavLink
            key={item.name}
            to={item.path}

            className={({ isActive }) =>
              `
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              transition
              ${
                isActive
                ? 'bg-orange-500'
                : 'hover:bg-stone-800'
              }
              `
            }
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