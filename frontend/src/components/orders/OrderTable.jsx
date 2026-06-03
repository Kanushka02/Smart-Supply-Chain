import {
  FaTrash,
  FaShoppingCart
}
from 'react-icons/fa';

function OrderTable({
  orders,
  onDelete
}) {

  if (orders.length === 0) {
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
          <FaShoppingCart />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No orders found
        </h3>
        <p className="text-gray-400">
          Orders will appear here once customers place them
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

            <th className="p-4 text-left">
              User
            </th>

            <th className="p-4 text-left">
              Product
            </th>

            <th className="p-4 text-left">
              Quantity
            </th>

            <th className="p-4 text-left">
              Total
            </th>

            <th className="p-4 text-left">
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
              hover:bg-gray-50
              transition
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
                  hover:text-red-700
                  transition
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