function Navbar() {
  return (

    <div
      className="
      bg-white
      shadow-sm
      px-6
      py-4
      flex
      justify-between
      items-center
      "
    >

      <h2
        className="
        text-2xl
        font-semibold
        "
      >
        Dashboard
      </h2>

      <div
        className="
        flex
        items-center
        gap-4
        "
      >
        <span className="text-gray-600">
          Admin
        </span>

        <div
          className="
          w-10
          h-10
          rounded-full
          bg-orange-500
          "
        />
      </div>

    </div>
  );
}

export default Navbar;