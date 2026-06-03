import {
  useState
}
from 'react';

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'SUPPLIER',
  companyName: '',
  phone: ''
};

function UserModal({
  isOpen,
  onClose,
  onSave,
  editingUser
}) {

  const [formData,
    setFormData] =
    useState(
      editingUser
        ? {
          ...editingUser,
          password: ''
        }
        : emptyUser
    );

  const handleChange =
  (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
      e.target.value
    });
  };

  const handleSubmit =
  (e) => {

    e.preventDefault();

    onSave(formData);

    onClose();
  };

  if (!isOpen)
    return null;

  return (

    <div
      className="
      fixed inset-0
      bg-black/50
      flex justify-center
      items-center
      z-50
      px-4
      "
    >

      <div
        className="
        bg-white
        p-6
        rounded-2xl
        w-full
        max-w-[450px]
        shadow-card
        "
      >

        <h2
          className="
          text-2xl
          font-bold
          mb-5
          "
        >
          {
            editingUser
            ? 'Edit User'
            : 'Add User'
          }
        </h2>

        <form
          onSubmit={
            handleSubmit
          }

          className="
          space-y-4
          "
        >

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={
              formData.name
            }

            onChange={
              handleChange
            }

            className="
            w-full border
            p-3 rounded-xl
            "
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={
              formData.email
            }

            onChange={
              handleChange
            }

            className="
            w-full border
            p-3 rounded-xl
            "
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={
              formData.password
            }

            onChange={
              handleChange
            }

            className="
            w-full border
            p-3 rounded-xl
            "
          />

          <select
            name="role"
            value={
              formData.role
            }

            onChange={
              handleChange
            }

            className="
            w-full border
            p-3 rounded-xl
            "
          >
            <option value="ADMIN">
              ADMIN
            </option>

            <option
              value="SUPPLIER"
            >
              SUPPLIER
            </option>
          </select>

          <input
            type="text"
            name="companyName"
            placeholder="Company Name"

            value={
              formData.companyName
            }

            onChange={
              handleChange
            }

            className="
            w-full border
            p-3 rounded-xl
            "
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"

            value={
              formData.phone
            }

            onChange={
              handleChange
            }

            className="
            w-full border
            p-3 rounded-xl
            "
          />

          <button
            className="
            bg-primary
            text-white
            px-5 py-3
            rounded-xl
            w-full
            hover:bg-orange-600
            transition
            "
          >
            Save User
          </button>

        </form>

      </div>

    </div>
  );
}

export default UserModal;
