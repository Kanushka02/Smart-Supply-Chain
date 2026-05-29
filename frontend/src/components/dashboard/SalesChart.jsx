import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
}
from 'recharts';

function SalesChart() {

  const data = [
    { month: 'Jan', sales: 10 },
    { month: 'Feb', sales: 25 },
    { month: 'Mar', sales: 15 },
    { month: 'Apr', sales: 35 },
    { month: 'May', sales: 20 }
  ];

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
        Sales Analytics
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart data={data}>

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="sales"
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default SalesChart;