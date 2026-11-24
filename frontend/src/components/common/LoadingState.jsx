import { Oval } from 'react-loader-spinner';

function LoadingState({
  label = 'Loading'
}) {
  return (
    <div
      className="
      flex min-h-[420px]
      flex-col items-center justify-center
      gap-4
      text-gray-500
      "
    >
      <Oval
        height={52}
        width={52}
        color="#4f46e5"
        secondaryColor="#e5e7eb"
        strokeWidth={3}
        strokeWidthSecondary={3}
        visible
        ariaLabel={label}
      />

      <span className="text-sm font-medium">
        {label}
      </span>
    </div>
  );
}

export default LoadingState;
