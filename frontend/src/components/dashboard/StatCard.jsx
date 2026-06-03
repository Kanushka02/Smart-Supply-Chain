function StatCard({
  title,
  value,
  icon
}) {

  return (

    <div
      className="
      bg-white
      rounded-[24px]
      p-6
      shadow-card
      hover:-translate-y-1
      transition
      duration-300
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

        <div
          className="
          flex h-12 w-12
          items-center justify-center
          rounded-2xl
          bg-orange-50
          text-2xl
          text-primary
          "
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

export default StatCard;
