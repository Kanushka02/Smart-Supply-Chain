import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaUsers, FaUserShield, FaTruck } from 'react-icons/fa';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingState from '../../components/common/LoadingState';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import StatCard from '../../components/dashboard/StatCard';
import UserTable from '../../components/users/UserTable';
import UserModal from '../../components/users/UserModal';

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../../services/userService';

const ROLE_FILTERS = [
  { key: 'ALL', label: 'All Roles' },
  { key: 'ADMIN', label: 'Admins' },
  { key: 'SUPPLIER', label: 'Suppliers' }
];

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getUsers();
      const usersData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchUsers();
    };
    void load();
  }, [fetchUsers]);

  const handleSave = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        toast.success('User updated');
      } else {
        await createUser(data);
        toast.success('User created');
      }
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(deletingUser.id);
      toast.success('User deleted');
      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.companyName?.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const supplierCount = users.filter((u) => u.role === 'SUPPLIER').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-sm text-slate-500">
          Manage platform administrators, supplier organizations, and active account permissions.
        </p>

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0"
        >
          <FaPlus className="text-xs" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Accounts" value={users.length} icon={<FaUsers />} />
        <StatCard title="Administrators" value={adminCount} icon={<FaUserShield />} />
        <StatCard title="Supplier Partners" value={supplierCount} icon={<FaTruck />} />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, email, or company..."
        filters={ROLE_FILTERS}
        activeFilter={roleFilter}
        onFilterChange={setRoleFilter}
        resultCount={filteredUsers.length}
      />

      {loading ? (
        <LoadingState label="Loading user directory" />
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={(user) => {
            setEditingUser(user);
            setIsModalOpen(true);
          }}
          onDelete={(user) => setDeletingUser(user)}
        />
      )}

      <UserModal
        key={editingUser?.id || 'new-user'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
        editingUser={editingUser}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        title="Delete user"
        message={
          deletingUser
            ? `Delete "${deletingUser.name}"? This action cannot be undone.`
            : ''
        }
        onCancel={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
}

export default Users;
