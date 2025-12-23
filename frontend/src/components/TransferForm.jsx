"use client"

// src/components/TransferForm.jsx
import { useState } from "react"
import api from "../api/axios"

export default function TransferForm({ balance }) {
  const [pin, setPin] = useState("")
  const [receiverUpiId, setReceiverUpiId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!receiverUpiId || !amount) {
      setError("All fields are required")
      return
    }

    if (!/^[\w.-]+@[\w.-]+$/.test(receiverUpiId)) {
      setError("Please enter a valid UPI ID")
      return
    }
    if (!pin) {
      setError("Transaction PIN is required")
      return
    }
    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number")
      return
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Available: ₹${balance.toFixed(2)}`)
      return
    }

    setLoading(true)
    try {
      await api.post("/transfer/", {
        receiver_upi_id: receiverUpiId,
        amount: amountNum,
        pin_number: pin,
      })
      setSuccess(`Successfully transferred ₹${amountNum.toFixed(2)}`)
      setReceiverUpiId("")
      setAmount("")
      setTimeout(() => {
        setSuccess("")
        // onSuccess();
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Transfer failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg flex items-start gap-2">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 rounded-lg flex items-start gap-2">
          <span className="text-lg flex-shrink-0">✓</span>
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="receiverUpiId" className="block text-sm font-semibold text-gray-700 mb-2">
            Receiver UPI ID
          </label>
          <input
            id="receiverUpiId"
            type="text"
            placeholder="yourname@bank"
            value={receiverUpiId}
            onChange={(e) => setReceiverUpiId(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="pin" className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Send Money</span>
            <span>→</span>
          </>
        )}
      </button>
    </form>
  )
}
