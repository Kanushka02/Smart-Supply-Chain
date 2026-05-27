import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import API
from '../../services/api';

function Users() {

  const [users, setUsers] =
    useState([]);

  useEffect(() => {

    API.get('/users')
      .then(res => {
        setUsers(res.data.data);
      })
      .catch(err => {
        console.error(err);
      });

  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">

        <h1 className="text-3xl font-bold mb-4">
          Users
        </h1>

        <div className="space-y-3">
          {users.map(user => (
            <div
              key={user.id}
              className="
                bg-white
                shadow-md
                rounded-xl
                p-4
              "
            >
              <p className="font-semibold">
                {user.name}
              </p>

              <p className="text-gray-500">
                {user.email}
              </p>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Users;