import {
  useState
}
from 'react';

import {
  useNavigate
}
from 'react-router-dom';

import toast
from 'react-hot-toast';

import {
  loginUser
}
from '../services/authService';

import {
  useAuth
}
from '../context/useAuth';

function Login() {

  const navigate =
  useNavigate();

  const { login } =
  useAuth();

  const [formData,
    setFormData] =
    useState({

      email: '',
      password: ''
    });

  const handleChange =
  (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
      e.target.value
    });
  };

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      const res =
      await loginUser(
        formData
      );

      login(
        res.data.token,
        res.data.user
      );

      toast.success(
        'Login Successful'
      );

      if (
        res.data.user.role
        === 'ADMIN'
      ) {

        navigate(
          '/admin'
        );

      } else {

        navigate(
          '/supplier'
        );
      }

    } catch {

      toast.error(
        'Invalid Credentials'
      );
    }
  };

  return (

    <div
      className="
      min-h-screen
      flex
      justify-center
      items-center
      bg-slate-100
      "
    >

      <div
        className="
        bg-white
        p-10
        rounded-3xl
        shadow-xl
        w-[400px]
        "
      >

        <h1
          className="
          text-3xl
          font-bold
          text-center
          mb-6
          "
        >
          Login
        </h1>

        <form
          onSubmit={
            handleSubmit
          }

          className="
          space-y-4
          "
        >

          <input
            type="email"
            name="email"
            placeholder="Email"

            onChange={
              handleChange
            }

            className="
            w-full
            p-3 border
            rounded-xl
            "
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"

            onChange={
              handleChange
            }

            className="
            w-full
            p-3 border
            rounded-xl
            "
            required
          />

          <button
            className="
            w-full
            bg-orange-500
            text-white
            p-3
            rounded-xl
            "
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;