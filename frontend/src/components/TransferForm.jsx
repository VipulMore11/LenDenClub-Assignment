// src/components/TransferForm.jsx
import { useState } from "react";
import api from "../api/axios";

export default function TransferForm({ onSuccess, balance }) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!receiverEmail || !amount) {
      setError("All fields are required");
      return;
    }

    if (!validateEmail(receiverEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Available: ₹${balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      await api.post("/transfer/", {
        receiver_email: receiverEmail,
        amount: amountNum,
      });
      setSuccess(`Successfully transferred ₹${amountNum.toFixed(2)}`);
      setReceiverEmail("");
      setAmount("");
      setTimeout(() => {
        setSuccess("");
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 max-w-lg w-full" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-3">Transfer Funds</h2>
      <p className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded mb-4 text-center">Current Balance: <strong className="block text-2xl">₹{balance.toFixed(2)}</strong></p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">{success}</div>}

      <div className="mb-4">
        <label htmlFor="receiverEmail" className="block text-sm font-medium mb-2">Receiver Email</label>
        <input
          id="receiverEmail"
          type="email"
          placeholder="Enter recipient's email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium mb-2">Amount (₹)</label>
        <input
          id="amount"
          type="number"
          placeholder="Enter amount"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <button type="submit" disabled={loading} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md font-semibold">
        {loading ? "Processing..." : "Send Money"}
      </button>
    </form>
  );
}
