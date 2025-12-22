import { useEffect, useState, useCallback } from "react";
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

  const fetchData = useCallback(async () => {
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
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user?.id) return;

    const ws = new WebSocket(
      `${process.env.REACT_APP_WS_BASE_URL}/ws/transactions/?user_id=${user.id}`
    );

    ws.onopen = () => {
      console.log("WS OPEN");
    };

    ws.onmessage = (event) => {
      console.log("WS MESSAGE", event.data);
      fetchData(); // 🔥 refresh transactions
    };

    ws.onclose = () => {
      console.log("WS CLOSED");
    };

    ws.onerror = (err) => {
      console.error("WS ERROR", err);
    };

    return () => ws.close();
  }, [user?.id, fetchData]);


  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-lg font-bold text-gray-900">LumaPay</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-700">{user?.username}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="col-span-full bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Available Balance</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-bold">₹{Number(balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </section>
          
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">💸</div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">Fund Transfer</h2>
                  <p className="text-sm text-gray-500">Send money securely to other users.</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : (
                <TransferForm onSuccess={fetchData} balance={balance} />
              )}
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                  <p className="text-sm text-gray-500">View your recent inflows and outflows.</p>
                </div>
                <div className="flex gap-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">Type: All</option>
                    <option value="SENT">Sent</option>
                    <option value="RECEIVED">Received</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">Status: All</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading transactions...</div>
            ) : (
              <TransactionTable
                transactions={transactions}
                currentUserEmail={user?.email}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
