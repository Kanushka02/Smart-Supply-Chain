import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
}
from 'recharts';

function InventoryChart({
  products
}) {

  const chartData =
    products.map(
      product => ({
        name:
          product.name,
        stock:
          product.stock
      })
    );

  return (

    <div
      className="
      bg-white
      rounded-2xl
      p-6
      shadow-md
      h-[350px]
      "
    >

      <h2
        className="
        text-xl
        font-bold
        mb-5
        "
      >
        Inventory Stock
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <BarChart
          data={chartData}
        >

          <XAxis
            dataKey="name"
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="stock"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default InventoryChart;