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
      sticky
      top-0
      z-10
      "
    >

      <h2
        className="
        text-2xl
        font-semibold
        text-secondary
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
        <span className="text-gray-600 font-medium">
          Admin
        </span>

        <div
          className="
          w-10
          h-10
          rounded-full
          bg-primary
          shadow-md
          "
        />
      </div>

    </div>
  );
}

export default Navbar;