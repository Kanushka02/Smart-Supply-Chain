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
      rounded-[24px]
      p-6
      shadow-card
      h-[350px]
      min-w-0
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
        height={300}
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
            fill="#f97316"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default InventoryChart;
