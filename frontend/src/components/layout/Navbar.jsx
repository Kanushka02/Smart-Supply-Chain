import {
  useAuth
} from '../../context/useAuth';

function Navbar() {
  const { user } =
    useAuth();

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
      z-30
      border-b
      border-gray-100
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
        <span
          className="
          text-sm
          font-semibold
          uppercase
          tracking-wide
          text-gray-600
          "
        >
          {user?.role || 'User'}
        </span>

        <div
          className="
          w-10
          h-10
          rounded-full
          bg-primary
          shadow-lg
          shadow-orange-500/20
          "
        />
      </div>

    </div>
  );
}

export default Navbar;
