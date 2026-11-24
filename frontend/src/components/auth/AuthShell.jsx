import { FaBrain, FaShieldAlt, FaBolt } from 'react-icons/fa';

const HIGHLIGHTS = [
  {
    icon: <FaBrain className="text-indigo-400" />,
    title: 'AI Demand Forecasting',
    desc: 'Lasso L1 & GBDT regression models predict next-month unit demand with sub-millisecond inference.'
  },
  {
    icon: <FaShieldAlt className="text-emerald-400" />,
    title: 'Atomic Order Integrity',
    desc: 'PostgreSQL row-locked transactions eliminate oversell race conditions and enforce role isolation.'
  },
  {
    icon: <FaBolt className="text-sky-400" />,
    title: 'Real-Time Risk Telemetry',
    desc: 'Socket.IO broadcasts instant stockout alerts and live order updates across Admin and Supplier portals.'
  }
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
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
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-white">
            SmartChain
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            ERP
          </span>
        </div>
        <p className="text-xs text-slate-400">Supply Chain Intelligence</p>
      </div>
    </div>
  );
}

export default function AuthShell({ headline, subheadline, children }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Enterprise Showcase Panel */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden bg-slate-950 text-white flex-col justify-between p-10 xl:p-12">
        {/* Ambient radial accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative z-10">
          <BrandMark />
        </div>

        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Production Microservices Platform
            </span>
            <h1 className="font-display text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-white">
              {headline}
            </h1>
            <p className="text-slate-300 text-sm xl:text-base leading-relaxed max-w-md">
              {subheadline}
            </p>
          </div>

          <div className="space-y-3.5 max-w-md">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
              >
                <div className="mt-0.5 p-2 rounded-lg bg-white/[0.06] text-base shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>PostgreSQL 16 · FastAPI ML · Redis 7</span>
          <span className="text-slate-500">v2.0 · Dockerized</span>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8">
        {/* Mobile Brand Header */}
        <div className="lg:hidden mb-6 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
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
          <span className="font-display text-xl font-bold text-slate-900">
            SmartChain <span className="text-indigo-600">ERP</span>
          </span>
        </div>

        {children}
      </main>
    </div>
  );
}
