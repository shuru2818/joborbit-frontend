import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0=send otp, 1=reset
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        }
        break;

      default:
        break;
    }

    return error;
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate field and update errors
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Clear general error when user starts typing
    if (error) setError('');
  }

  const validateForm = () => {
    const errors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };

    setFieldErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error !== '');
  };

  async function submitData(e) {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);
      login(res.data);
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');

    if (!forgotData.email.trim()) {
      setError('Email address is required to reset password.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await API.post('/auth/forgot', { email: forgotData.email });
      setForgotMessage(res.data?.message || 'OTP sent to your email.');
      setForgotStep(1);
      setForgotData((prev) => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');

    const { email, otp, newPassword, confirmPassword } = forgotData;

    if (!email.trim() || !otp.trim() || !newPassword || !confirmPassword) {
      setError('All fields are required for password reset.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { email, otp, newPassword });
      setForgotMessage(res.data?.message || 'Password changed successfully. Please login with new password.');
      setForgotMode(false);
      setForgotStep(0);
      setFormData({ email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForgotForm = () => (
    <form className="mt-8 space-y-6" onSubmit={forgotStep === 0 ? handleForgotSendOtp : handleForgotReset}>
      <div className="bg-white/80 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-3xl border border-white/20">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {forgotMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {forgotMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="forgotEmail"
                type="email"
                value={forgotData.email}
                onChange={(e) => setForgotData((prev) => ({ ...prev, email: e.target.value }))}
                className="appearance-none relative block w-full pl-12 pr-4 py-4 border border-gray-300 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {forgotStep === 1 && (
            <>
              <div>
                <label htmlFor="forgotOtp" className="block text-sm font-semibold text-gray-700 mb-3">Verification Code</label>
                <input
                  id="forgotOtp"
                  type="text"
                  value={forgotData.otp}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, otp: e.target.value.trim() }))}
                  className="appearance-none relative block w-full px-4 py-4 border border-gray-300 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter verification code"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={forgotData.newPassword}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="appearance-none relative block w-full px-4 py-4 border border-gray-300 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={forgotData.confirmPassword}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="appearance-none relative block w-full px-4 py-4 border border-gray-300 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={forgotLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {forgotLoading ? 'Processing...' : (forgotStep === 0 ? 'Send Reset Code' : 'Reset Password')}
            </button>
          </div>

          <div className="text-center">
            <button type="button" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors" onClick={() => {
              setForgotMode(false);
              setForgotStep(0);
              setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
              setError('');
              setForgotMessage('');
            }}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  if (forgotMode) {
    return renderForgotForm();
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/Logo.jpeg" alt="Job Orbit Logo" className="mx-auto h-20 w-20 object-cover rounded-2xl shadow-2xl border-4 border-white" />
          <h2 className="mt-8 text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Sign in to your Job Orbit account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={submitData}>
          <div className="bg-white/80 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-3xl border border-white/20">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-12 pr-4 py-4 border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 ${
                      fieldErrors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-12 pr-12 py-4 border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 ${
                      fieldErrors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-indigo-600 transition-colors">
                Create one now
              </Link>
            </p>
            <button
              type="button"
              onClick={() => {
                setForgotMode(true);
                setError('');
                setForgotMessage('');
                setForgotStep(0);
                setForgotData({ email: formData.email || '', otp: '', newPassword: '', confirmPassword: '' });
              }}
              className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;