import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/login/", { email, password });
      localStorage.setItem("token", res.data.access);
      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
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
          <div className="text-sm text-gray-600">New to LumaPay?</div>
          <Link to="/signup" className="px-4 py-1 bg-white rounded-md text-sm font-medium shadow-sm">Sign up</Link>
        </div>
      </header>

      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-extrabold text-center text-gray-900">Welcome back</h2>
            <p className="text-center text-sm text-gray-500 mt-2 mb-6">Please enter your details to sign in.</p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                </div>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
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

              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-600 mt-6">Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold">Sign up</Link></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
