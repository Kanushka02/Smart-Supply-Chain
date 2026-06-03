import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function DashboardLayout({
  children
}) {

  const [open, setOpen] = useState(false);

  return (

    <div className="flex">

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static
          left-0 top-0 z-50
          h-screen
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Content */}

      <div
        className="
        flex-1
        bg-background
        min-h-screen
        w-full lg:w-auto
        "
      >

        <Navbar />

        <main className="p-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="
            lg:hidden
            mb-4
            bg-primary
            text-white
            p-3 rounded-xl
            hover:bg-orange-600
            transition
            "
          >
            <FaBars />
          </button>

          {children}

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;