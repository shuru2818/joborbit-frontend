import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const OTPVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !otp) {
      setError("Please provide both email and OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/verify", { email, otp });
      login(res.data);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendMessage("");

    if (!email) {
      setError("Please enter your email to resend OTP.");
      return;
    }

    setResendLoading(true);
    try {
      const res = await API.post("/auth/resend", { email });
      setResendMessage(res.data?.message || "OTP resent successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-xl shadow-lg p-7">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">OTP Verification</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the OTP sent to your email to finish account verification.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{error}</div>
        )}

        {resendMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded">{resendMessage}</div>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-center">
            Verified successfully! Redirecting to dashboard...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="123456"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-500">
          Already verified? <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;
