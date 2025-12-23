"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import TransferForm from "../components/TransferForm"
import TransactionTable from "../components/TransactionTable"

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(() => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.balance != null) return Number(parsed.balance)
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e)
    }
    return 0
  })
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
    }
  }, [navigate])
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/profile/")
      setProfile(res.data.user)

      // Keep balance in sync with backend truth
      if (res.data.user?.balance != null) {
        setBalance(Number(res.data.user.balance))
      }
    } catch (err) {
      console.error("Failed to fetch profile", err)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = {}
      if (typeFilter !== "ALL") params.type = typeFilter
      if (statusFilter !== "ALL") params.status = statusFilter

      const res = await api.get("/transactions/", { params })
      setTransactions(res.data)
      if (res.data.length > 0) {
        setBalance(res.data[0].balance)
      } else {
        // No transactions returned: fall back to stored user balance (if any)
        try {
          const stored = localStorage.getItem("user")
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed?.balance != null) setBalance(Number(parsed.balance))
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e)
        }
      }
    } catch (err) {
      setError("Failed to load transactions. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);


  useEffect(() => {
    if (!user?.id) return

    const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE_URL}/ws/transactions/?user_id=${user.id}`)

    ws.onopen = () => {
      console.log("WS OPEN")
    }

    ws.onmessage = (event) => {
      console.log("WS MESSAGE", event.data)
      fetchData()
      fetchProfile()
    }

    ws.onclose = () => {
      console.log("WS CLOSED")
    }

    ws.onerror = (err) => {
      console.error("WS ERROR", err)
    }

    return () => ws.close()
  }, [user?.id, fetchData, fetchProfile])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              L
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LumaPay
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.username}</span>
            <img
              src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.username || "user")}`}
              alt="Profile"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-indigo-200 shadow-sm"
            />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <section className="lg:col-span-1">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <h3 className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wide mb-3 sm:mb-4">
                  Available Balance
                </h3>
                <p className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 tracking-tight">
                  ₹{Number(balance || 0).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="font-medium text-white/80">UPI ID:</span>
                  <span className="font-mono bg-white/20 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    {profile?.upi_id || "—"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                  💸
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Fund Transfer</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Send money securely to other users.</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-3">Loading...</p>
                </div>
              ) : (
                <TransferForm balance={balance} />
              )}
            </div>
          </section>
        </div>

        <section className="mt-4 sm:mt-6 lg:mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Transaction History</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View your recent inflows and outflows.</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="ALL">Type: All</option>
                    <option value="SENT">Sent</option>
                    <option value="RECEIVED">Received</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="ALL">Status: All</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 mt-3">Loading transactions...</p>
              </div>
            ) : (
              <TransactionTable transactions={transactions} currentUserUpiId={profile?.upi_id} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
