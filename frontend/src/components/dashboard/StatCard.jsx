function StatCard({
  title,
  value
}) {

  return (

    <div
      className="
      bg-white
      rounded-2xl
      shadow-md
      p-6
      "
    >

      <h3
        className="
        text-gray-500
        mb-2
        "
      >
        {title}
      </h3>

      <h1
        className="
        text-3xl
        font-bold
        "
      >
        {value}
      </h1>

    </div>
  );
}

export default StatCard;