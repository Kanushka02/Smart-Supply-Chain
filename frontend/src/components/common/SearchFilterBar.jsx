import { FaSearch } from 'react-icons/fa';

function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
  activeFilter,
  onFilterChange,
  resultCount
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-3.5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {filter.label}
            </button>
          );
        })}

        {typeof resultCount === 'number' && (
          <span className="ml-1 text-xs font-medium text-slate-400 tabular-nums">
            {resultCount} {resultCount === 1 ? 'record' : 'records'}
          </span>
        )}
      </div>
    </div>
  );
}

export default SearchFilterBar;
