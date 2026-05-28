import {
  FaEdit,
  FaTrash
} from 'react-icons/fa';

function ProductTable({
  products = [],
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