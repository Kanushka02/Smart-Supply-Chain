import {
  useState
}
from 'react';

import {
  useNavigate
} from 'react-router-dom';

import toast
from 'react-hot-toast';

import {
  registerUser
}
from '../services/authService';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success('Registration Successful');
      navigate('/login');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Registration failed'
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 px-4 py-8">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[440px] max-w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-sm text-slate-600 mb-6">
          Register as a supplier to start managing products and orders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            required
          />

          <button className="w-full bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-orange-500 hover:text-orange-600"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;