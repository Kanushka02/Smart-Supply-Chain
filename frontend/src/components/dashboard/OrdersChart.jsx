import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
}
from 'recharts';

function OrdersChart({
  orders
}) {

  const monthlyData =
    Array.from(
      { length: 12 },
      (_, i) => ({
        month:
          [
            'Jan','Feb','Mar',
            'Apr','May','Jun',
            'Jul','Aug','Sep',
            'Oct','Nov','Dec'
          ][i],

        orders: 0
      })
    );

  orders.forEach(order => {

    const month =
      new Date(
        order.createdAt
      ).getMonth();

    monthlyData[
      month
    ].orders += 1;
  });

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
        Orders Trend
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <LineChart
          data={monthlyData}
        >

          <XAxis
            dataKey="month"
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="orders"
            stroke="#f97316"
            strokeWidth={3}
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: '#ffffff'
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default OrdersChart;
