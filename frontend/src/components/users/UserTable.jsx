import {
  FaEdit,
  FaTrash,
  FaUsers
}
from 'react-icons/fa';

function UserTable({
  users,
  onEdit,
  onDelete
}) {

  if (users.length === 0) {
    return (
      <div
        className="
        bg-white
        rounded-2xl
        shadow-card
        overflow-hidden
        p-12
        text-center
        "
      >
        <div className="text-5xl text-gray-300 mb-4 flex justify-center">
          <FaUsers />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No users found
        </h3>
        <p className="text-gray-400">
          Users will appear here once they register
        </p>
      </div>
    );
  }

  return (

    <div
      className="
      bg-white
      rounded-2xl
      shadow-card
      overflow-x-auto
      "
    >

      <table
        className="
        min-w-[840px]
        w-full
        "
      >

        <thead
          className="
          bg-gray-100
          "
        >

          <tr>

            <th className="p-4 text-left">
              Name
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Role
            </th>

            <th className="p-4 text-left">
              Status
            </th>

            <th className="p-4 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map(user => (

            <tr
              key={user.id}
              className="
              border-t
              hover:bg-gray-50
              transition
              "
            >

              <td className="p-4">
                {user.name}
              </td>

              <td className="p-4">
                {user.email}
              </td>

              <td className="p-4">

                <span
                  className={`
                  px-3 py-1
                  rounded-full
                  text-sm
                  font-medium
                  ${
                    user.role
                    === 'ADMIN'
                    ? 'bg-red-100 text-red-500'
                    : 'bg-blue-100 text-blue-500'
                  }
                  `}
                >
                  {user.role}
                </span>

              </td>

              <td className="p-4">

                <span
                  className={`
                  px-3 py-1
                  rounded-full
                  text-sm
                  font-medium
                  ${
                    user.isActive
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                  }
                  `}
                >
                  {
                    user.isActive
                    ? 'Active'
                    : 'Inactive'
                  }
                </span>

              </td>

              <td className="p-4">

                <div className="flex gap-3">

                  <button
                    type="button"
                    aria-label={`Edit ${user.name}`}
                    onClick={() =>
                      onEdit(user)
                    }

                    className="
                    text-blue-500
                    hover:text-blue-700
                    transition
                    "
                  >
                    <FaEdit />
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${user.name}`}
                    onClick={() =>
                      onDelete(
                        user
                      )
                    }

                    className="
                    text-red-500
                    hover:text-red-700
                    transition
                    "
                  >
                    <FaTrash />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserTable;
