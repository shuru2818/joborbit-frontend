import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const OTPVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otp = otpDigits.join("");
    if (!email || otp.length !== 6) {
      setError("Please provide your email and the 6-digit OTP.");
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

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otpDigits];
    nextOtp[index] = value;
    setOtpDigits(nextOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length === 0) return;
    const nextOtp = [...otpDigits];
    for (let i = 0; i < 6; i += 1) {
      nextOtp[i] = digits[i] || "";
    }
    setOtpDigits(nextOtp);

    const focusIndex = Math.min(digits.length, 5);
    const nextInput = document.getElementById(`otp-${focusIndex}`);
    nextInput?.focus();
  };

  const handleResend = async () => {
    setError("");
    setResendMessage("");

    if (resendCountdown > 0) {
      setError(`Please wait ${resendCountdown} second${resendCountdown === 1 ? "" : "s"} before resending OTP.`);
      return;
    }

    if (!email) {
      setError("Please enter your email to resend OTP.");
      return;
    }

    setResendLoading(true);
    try {
      const res = await API.post("/auth/resend", { email });
      setResendMessage(res.data?.message || "OTP resent successfully.");
      setResendCountdown(60);
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

            <div className="flex justify-end items-center gap-2 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendCountdown > 0}
                className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
              >
                {resendLoading
                  ? "Resending..."
                  : resendCountdown > 0
                  ? `Resend OTP (${resendCountdown}s)`
                  : "Resend OTP"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <div className="flex gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    required
                    className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join("").length !== 6}
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
