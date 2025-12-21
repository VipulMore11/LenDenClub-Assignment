import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TransferForm from "../components/TransferForm";
import TransactionTable from "../components/TransactionTable";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.balance != null) return Number(parsed.balance);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return 0;
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (typeFilter !== "ALL") params.type = typeFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/transactions/", { params });
      setTransactions(res.data);
      if (res.data.length > 0) {
        setBalance(res.data[0].balance);
      } else {
        // No transactions returned: fall back to stored user balance (if any)
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.balance != null) setBalance(Number(parsed.balance));
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, statusFilter]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LenDenClub</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <div className="text-xs text-white/90">{user?.username || "User"}</div>
              <div className="text-sm font-semibold">Balance: <span className="ml-1">₹{Number(balance || 0).toFixed(2)}</span></div>
            </div>
            <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {error && <div className="col-span-full bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

        <section className="lg:col-span-1">
          <TransferForm onSuccess={fetchData} balance={balance} />
        </section>
        
        <section className="lg:col-span-2">
          <div className="flex gap-4 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="ALL">All</option>
            <option value="SENT">Sent</option>
            <option value="RECEIVED">Received</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-6">Loading transactions...</div>
          ) : (
            <TransactionTable
              transactions={transactions}
              currentUserEmail={user?.email}
            />
          )}
        </section>
      </main>
    </div>
  );
}
