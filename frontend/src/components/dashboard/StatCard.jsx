function StatCard({
  title,
  value,
  icon
}) {

  return (

    <div
      className="
      bg-white
      rounded-2xl
      p-6
      shadow-md
      hover:shadow-lg
      transition
      "
    >

      <div
        className="
        flex justify-between
        items-center
        "
      >

        <div>

          <p
            className="
            text-gray-500
            "
          >
            {title}
          </p>

          <h1
            className="
            text-3xl
            font-bold
            mt-2
            "
          >
            {value}
          </h1>

        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default StatCard;