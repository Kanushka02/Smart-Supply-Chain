
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
      rounded-2xl
      p-6
      shadow-md
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
          <p>
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
              border-b py-3
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