function ConfirmDialog({
  isOpen,
  title = 'Confirm action',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onCancel,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div
      className="
      fixed inset-0 z-[70]
      flex items-center justify-center
      bg-black/50
      px-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="
        w-full max-w-md
        rounded-xl2
        bg-white
        p-6
        shadow-card
        "
      >
        <h2
          id="confirm-dialog-title"
          className="
          text-xl font-bold
          text-secondary
          "
        >
          {title}
        </h2>

        <p
          className="
          mt-3
          text-sm leading-6
          text-gray-600
          "
        >
          {message}
        </p>

        <div
          className="
          mt-6
          flex flex-col-reverse gap-3
          sm:flex-row sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onCancel}
            className="
            rounded-xl
            border border-gray-200
            px-5 py-3
            font-medium
            text-gray-700
            transition
            hover:bg-gray-50
            "
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
            rounded-xl
            bg-danger
            px-5 py-3
            font-medium
            text-white
            transition
            hover:bg-red-600
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
