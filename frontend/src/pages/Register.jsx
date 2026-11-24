import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight,
  FaShieldAlt
} from 'react-icons/fa';

import AuthShell from '../components/auth/AuthShell';
import { registerUser } from '../services/authService';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-500', text: 'text-sky-600' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
}

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const strength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    setErrorMsg('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await registerUser({
        name: formData.name.trim(),
        companyName: formData.companyName.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password
      });

      toast.success('Supplier account created! You can now sign in.');
      navigate('/login');
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(serverMessage);
      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      headline="Onboard your supply chain operations in minutes."
      subheadline="Create a verified Supplier workspace to list catalog SKUs, process orders atomically, and receive AI-driven restock alerts."
    >
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/80 shadow-card p-7 sm:p-8">
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
            <FaShieldAlt className="text-[10px]" />
            Supplier Partner Onboarding
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Create your account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Register to start managing products, inventory, and orders.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-sm text-rose-700"
          >
            <FaExclamationCircle className="mt-0.5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
              >
                Full Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="Alex Perera"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-company"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
              >
                Company Name
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  id="reg-company"
                  type="text"
                  name="companyName"
                  placeholder="Ceylon Logistics Ltd"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
              >
                Work Email *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
            >
              Password *
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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

            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 rounded-full transition-colors ${
                        step <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[11px] font-medium mt-1 ${strength.text}`}>
                  Password strength: {strength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-confirm-password"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
            >
              Confirm Password *
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.confirmPassword && (
              <p
                className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
                  passwordsMatch ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {passwordsMatch ? (
                  <>
                    <FaCheckCircle /> Passwords match
                  </>
                ) : (
                  'Passwords do not match'
                )}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Supplier Account
                <FaArrowRight className="text-xs" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default Register;
