import {
  useEffect,
  useState
}
from 'react';

import toast
  from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

import ConfirmDialog
from '../../components/common/ConfirmDialog';

import LoadingState
from '../../components/common/LoadingState';

import UserTable
from '../../components/users/UserTable';

import UserModal
from '../../components/users/UserModal';

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
}
from '../../services/userService';

function Users() {

  const [users,
    setUsers] =
    useState([]);

  const [search,
    setSearch] =
    useState('');

  const [isModalOpen,
    setIsModalOpen] =
    useState(false);

  const [editingUser,
    setEditingUser] =
    useState(null);

  const [deletingUser,
    setDeletingUser] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const fetchUsers =
  async () => {

    try {
      const res =
        await getUsers();

      const usersData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(
        'Failed to load users'
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadUsers() {

      try {
        const res =
          await getUsers();

        const usersData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error(
          'Failed to load users'
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const handleSave =
  async (userData) => {

    try {
      if (editingUser) {

        await updateUser(
          editingUser.id,
          userData
        );

        toast.success(
          'User Updated'
        );

      } else {

        await createUser(
          userData
        );

        toast.success(
          'User Created'
        );
      }

      fetchUsers();

      setEditingUser(
        null
      );
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(
        'Something went wrong'
      );
    }
  };

  const handleDelete =
  (user) => {
    setDeletingUser(user);
  };

  const confirmDelete =
  async () => {
    try {
      await deleteUser(
        deletingUser.id
      );

      toast.success(
        'User Deleted'
      );

      setDeletingUser(null);

      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(
        'Failed to delete user'
      );
    }
  };

  const filteredUsers =
    users.filter(user =>
      user.name
      .toLowerCase()
      .includes(
        search
        .toLowerCase()
      )
    );

  return (

    <DashboardLayout>

      <div
        className="
        flex flex-col
        gap-4
        sm:flex-row sm:justify-between
        sm:items-center
        mb-6
        "
      >

        <h1
          className="
          text-3xl
          font-bold
          "
        >
          Users Management
        </h1>

        <button
          onClick={() =>
            setIsModalOpen(
              true
            )
          }

          className="
          bg-primary
          text-white
          px-5 py-3
          rounded-xl
          hover:bg-indigo-700
          transition
          w-full
          sm:w-auto
          "
        >
          Add User
        </button>

      </div>

      <input
        type="text"
        placeholder="Search users..."

        value={search}

        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }

        className="
        w-full
        border
        border-gray-300
        p-3
        rounded-xl
        mb-5
        focus:outline-none
        focus:border-primary
        "
      />

      {loading ? (
        <LoadingState label="Loading users" />
      ) : (
        <UserTable
          users={
            filteredUsers
          }

          onEdit={(user) => {

            setEditingUser(
              user
            );

            setIsModalOpen(
              true
            );
          }}

          onDelete={
            handleDelete
          }
        />
      )}

      <UserModal
        key={
          editingUser?.id || 'new-user'
        }
        isOpen={
          isModalOpen
        }

        onClose={() => {

          setIsModalOpen(
            false
          );

          setEditingUser(
            null
          );
        }}

        onSave={
          handleSave
        }

        editingUser={
          editingUser
        }
      />

      <ConfirmDialog
        isOpen={Boolean(
          deletingUser
        )}
        title="Delete user"
        message={`Delete ${deletingUser?.name || 'this user'}? This action cannot be undone.`}
        onCancel={() =>
          setDeletingUser(null)
        }
        onConfirm={
          confirmDelete
        }
      />

    </DashboardLayout>
  );
}

export default Users;
