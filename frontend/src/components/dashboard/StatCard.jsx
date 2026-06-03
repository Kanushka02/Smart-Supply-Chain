function StatCard({
  title,
  value,
  icon
}) {

  return (

    <div
      className="
      bg-white
      rounded-xl2
      p-6
      shadow-card
      hover:shadow-lg
      transition
      border-l-4
      border-primary
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
            text-sm
            "
          >
            {title}
          </p>

          <h1
            className="
            text-3xl
            font-bold
            mt-2
            text-secondary
            "
          >
            {value}
          </h1>

        </div>

        <div className="text-3xl text-primary">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default StatCard;