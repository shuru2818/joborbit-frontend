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
      <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {forgotMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {forgotMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input
              id="forgotEmail"
              type="email"
              value={forgotData.email}
              onChange={(e) => setForgotData((prev) => ({ ...prev, email: e.target.value }))}
              className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          {forgotStep === 1 && (
            <>
              <div>
                <label htmlFor="forgotOtp" className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                <input
                  id="forgotOtp"
                  type="text"
                  value={forgotData.otp}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, otp: e.target.value.trim() }))}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter OTP"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={forgotData.newPassword}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={forgotData.confirmPassword}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={forgotLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {forgotLoading ? 'Processing...' : (forgotStep === 0 ? 'Send OTP' : 'Reset Password')}
            </button>
          </div>

          <div className="text-center">
            <button type="button" className="text-sm text-blue-600 hover:text-blue-500" onClick={() => {
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your AI Job Tracker account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={submitData}>
          <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                    className={`appearance-none relative block w-full px-10 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                      fieldErrors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-10 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                      fieldErrors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your password"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  'Sign in'
                )}
              </button>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign up for free
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
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;