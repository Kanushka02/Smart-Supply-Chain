import {
  useEffect,
  useState
}
from 'react';

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

      } else {

        await createUser(
          userData
        );
      }

      fetchUsers();

      setEditingUser(
        null
      );
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDelete =
  async (id) => {

    try {
      await deleteUser(id);

      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
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
          bg-orange-500
          text-white
          px-5 py-3
          rounded-xl
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
        p-3
        rounded-xl
        mb-5
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