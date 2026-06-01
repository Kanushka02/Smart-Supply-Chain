import {
  FaEdit,
  FaTrash
}
from 'react-icons/fa';

function UserTable({
  users,
  onEdit,
  onDelete
}) {

  return (

    <div
      className="
      bg-white
      rounded-2xl
      shadow-md
      overflow-hidden
      "
    >

      <table
        className="
        w-full
        "
      >

        <thead
          className="
          bg-gray-100
          "
        >

          <tr>

            <th className="p-4">
              Name
            </th>

            <th className="p-4">
              Email
            </th>

            <th className="p-4">
              Role
            </th>

            <th className="p-4">
              Status
            </th>

            <th className="p-4">
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
                    onClick={() =>
                      onEdit(user)
                    }

                    className="
                    text-blue-500
                    "
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() =>
                      onDelete(
                        user.id
                      )
                    }

                    className="
                    text-red-500
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