import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaArrowRight,
  FaUserShield,
  FaTruck
} from 'react-icons/fa';

import AuthShell from '../components/auth/AuthShell';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/useAuth';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setErrorMsg('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const applyDemoCredentials = (email, password) => {
    setErrorMsg('');
    setFormData({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      login(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user
      );

      toast.success(`Welcome back, ${res.data.user.name}`);

      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/supplier');
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        'Unable to sign in. Please verify your email and password.';
      setErrorMsg(serverMessage);
      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      headline="Intelligent supply chain visibility from warehouse to demand."
      subheadline="Sign in to monitor real-time inventory levels, execute atomic procurement orders, and review ML demand forecasts."
    >
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200/80 shadow-card p-7 sm:p-9">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your credentials to access your role workspace.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-sm text-rose-700"
          >
            <FaExclamationCircle className="mt-0.5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
            >
              Work Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FaArrowRight className="text-xs" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credential Fill for Seeded Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Fill Seeded Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                applyDemoCredentials('admin@smartchain.io', 'Admin@123')
              }
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition cursor-pointer"
            >
              <FaUserShield className="text-indigo-600" />
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() =>
                applyDemoCredentials('supplier@smartchain.io', 'Supplier@123')
              }
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition cursor-pointer"
            >
              <FaTruck className="text-emerald-600" />
              Supplier Demo
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New supplier partner?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default Login;
