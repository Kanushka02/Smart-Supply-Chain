import {
  useEffect,
  useState
}
from 'react';

import toast
  from 'react-hot-toast';

import DashboardLayout
from '../../components/layout/DashboardLayout';

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
    }
  };

  useEffect(() => {
    fetchUsers();
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
  async (id) => {

    const confirmDelete =
      window.confirm(
        'Delete this user?'
      );

    if (!confirmDelete)
      return;

    try {
      await deleteUser(id);

      toast.success(
        'User Deleted'
      );

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
        flex justify-between
        items-center
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
          hover:bg-orange-600
          transition
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

      <UserModal
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

    </DashboardLayout>
  );
}

export default Users;