import {
  FaTrash
}
from 'react-icons/fa';

function OrderTable({
  orders,
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

      <table className="w-full">

        <thead
          className="
          bg-gray-100
          "
        >

          <tr>

            <th className="p-4">
              User
            </th>

            <th className="p-4">
              Product
            </th>

            <th className="p-4">
              Quantity
            </th>

            <th className="p-4">
              Total
            </th>

            <th className="p-4">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {orders.map(order => (

            <tr
              key={order.id}
              className="
              border-t
              "
            >

              <td className="p-4">
                {
                  order.user?.name
                }
              </td>

              <td className="p-4">
                {
                  order.product
                  ?.name
                }
              </td>

              <td className="p-4">
                {
                  order.quantity
                }
              </td>

              <td className="p-4">
                Rs.
                {
                  order.totalPrice
                }
              </td>

              <td className="p-4">

                <button
                  onClick={() =>
                    onDelete(
                      order.id
                    )
                  }

                  className="
                  text-red-500
                  "
                >
                  <FaTrash />
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default OrderTable;