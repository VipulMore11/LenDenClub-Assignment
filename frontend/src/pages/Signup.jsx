import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/signup/", { email, username, password });
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
      <header className="py-4 px-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">L</div>
          <div className="text-lg font-semibold">LumaPay</div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/" className="px-4 py-1 bg-white rounded-md text-sm font-medium shadow-sm">Login</Link>
        </div>
      </header>

      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">👤</div>
              <h2 className="text-2xl font-extrabold text-gray-900">Create your account</h2>
              <p className="text-sm text-gray-500 mt-2">Join the future of peer-to-peer lending today.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mt-6">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mt-6">{success}</div>}

            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg">
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
