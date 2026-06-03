import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function DashboardLayout({
  children
}) {

  const [open, setOpen] = useState(false);

  return (

    <div
      className="
      flex
      min-h-screen
      bg-background
      "
    >

      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="
          fixed inset-0 z-40
          bg-black/40
          lg:hidden
          "
        />
      )}

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
        min-h-screen
        min-w-0
        "
      >

        <Navbar />

        <main
          className="
          w-full
          px-4 py-5
          sm:px-6
          lg:px-7 lg:py-6
          "
        >
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Open sidebar"
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
