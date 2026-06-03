import {
  FaEdit,
  FaTrash,
  FaBox
} from 'react-icons/fa';

function ProductTable({
  products = [],
  onEdit,
  onDelete
}) {

  if (products.length === 0) {
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
          <FaBox />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No products found
        </h3>
        <p className="text-gray-400">
          Start by adding your first product
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

      <table
        className="
        w-full
        text-left
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
              Price
            </th>

            <th className="p-4">
              Stock
            </th>

            <th className="p-4">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          {products.map(product => (

            <tr
              key={product.id}
              className="
              border-t
              hover:bg-gray-50
              transition
              "
            >

              <td className="p-4">
                {product.name}
              </td>

              <td className="p-4">
                Rs.
                {product.price}
              </td>

              <td className="p-4">
                {product.stock}
              </td>

              <td className="p-4">

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      onEdit(product)
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
                    onClick={() =>
                      onDelete(
                        product.id
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

export default ProductTable;