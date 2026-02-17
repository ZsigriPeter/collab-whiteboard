import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';

const PasswordRequirement = ({ met, text }) => (
  <li className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
    {text}
  </li>
);

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm:'',
    first_name:'',
    last_name:'',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const passwordRules = [
    { met: form.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(form.password), text: 'One number' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password || !form.password_confirm || !form.first_name || !form.last_name) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!passwordRules.every((r) => r.met)) {
      setError('Password does not meet the requirements');
      return;
    }

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(form.username, form.email, form.password,form.password_confirm,form.first_name,form.last_name);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-7">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlus size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
            </div>
            <p className="text-indigo-200 text-sm ml-12">
              Sign up to start using your whiteboard
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.trim() }))}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Choose a username"
                required
                disabled={isLoading}
              />
            </div>
            {/* Firstname */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value.trim() }))}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="John"
                required
                disabled={isLoading}
              />
            </div>{/* Lastname */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value.trim() }))}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Doe"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Create a password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password requirements */}
              {form.password.length > 0 && (
                <ul className="mt-2 space-y-1 pl-1">
                  {passwordRules.map((rule) => (
                    <PasswordRequirement key={rule.text} met={rule.met} text={rule.text} />
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.password_confirm}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    form.password_confirm.length > 0
                      ? form.password === form.password_confirm
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Repeat your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password_confirm.length > 0 && form.password !== form.password_confirm && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>

            {/* Divider + Login link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline transition"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
