import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky lg:top-0
          left-0 top-0 z-50
          h-screen shrink-0
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col">
        <Navbar onMenuOpen={() => setOpen((prev) => !prev)} />

        <main className="flex-1 w-full px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
