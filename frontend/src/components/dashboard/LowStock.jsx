
function LowStock({
  products
}) {

  const lowStock =
    products.filter(
      p => p.stock < 10
    );

  return (

    <div
      className="
      bg-white
      rounded-[24px]
      p-6
      shadow-card
      "
    >

      <h2
        className="
        text-xl
        font-bold
        mb-4
        "
      >
        Low Stock Alert
      </h2>

      {
        lowStock.length === 0
        ? (
          <p
            className="
            rounded-xl
            bg-green-50
            p-4
            text-sm
            font-medium
            text-green-700
            "
          >
            All products
            have enough stock
          </p>
        )
        : (
          lowStock.map(
            product => (

            <div
              key={
                product.id
              }

              className="
              flex justify-between
              border-b border-gray-100
              py-3
              "
            >

              <span>
                {
                  product.name
                }
              </span>

              <span
                className="
                text-red-500
                font-bold
                "
              >
                {
                  product.stock
                }
                left
              </span>

            </div>

          ))
        )
      }

    </div>
  );
}

export default LowStock;
