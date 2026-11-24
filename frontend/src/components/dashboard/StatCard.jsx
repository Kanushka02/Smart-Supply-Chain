function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:border-indigo-200 hover:-translate-y-0.5 transition duration-200">
      <div className="flex justify-between items-center gap-3">
        <div className="min-w-0">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold mt-1.5 text-slate-900 truncate">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 border border-indigo-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
