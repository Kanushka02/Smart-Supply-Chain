import { FaEdit, FaTrash, FaUsers, FaUserShield, FaTruck } from 'react-icons/fa';
import { getInitials } from '../../utils/formatters';

function UserTable({ users = [], onEdit, onDelete }) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
          <FaUsers />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-800 mb-1">
          No matching users
        </h3>
        <p className="text-sm text-slate-500">
          Try clearing your search filter or add a new account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left border-collapse">
          <thead className="bg-slate-50/90 border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                User
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Contact
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Role
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isAdmin = user.role === 'ADMIN';
              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                          isAdmin
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.companyName || 'Independent Partner'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <p className="text-sm text-slate-700">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user.phone || 'No phone on file'}
                    </p>
                  </td>

                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isAdmin
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {isAdmin ? (
                        <FaUserShield className="text-[10px]" />
                      ) : (
                        <FaTruck className="text-[10px]" />
                      )}
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Edit ${user.name}`}
                        onClick={() => onEdit(user)}
                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Edit user"
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete ${user.name}`}
                        onClick={() => onDelete(user)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete user"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
