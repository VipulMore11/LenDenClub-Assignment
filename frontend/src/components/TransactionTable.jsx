
import React, { useState, useMemo } from "react";

export default function TransactionTable({ transactions, currentUserUpiId }) {

  const [sortColumn, setSortColumn] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const getAvatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`;

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let aVal, bVal;

      if (sortColumn === "timestamp") {
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
      } else if (sortColumn === "type") {
        const aType = a.sender_upi_id === currentUserUpiId ? "Sent" : "Received";
        const bType = b.sender_upi_id === currentUserUpiId ? "Sent" : "Received";
        aVal = aType;
        bVal = bType;
      } else if (sortColumn === "users") {
        const aParty = a.sender_upi_id === currentUserUpiId ? a.receiver_upi_id : a.sender_upi_id;
        const bParty = b.sender_upi_id === currentUserUpiId ? b.receiver_upi_id : b.sender_upi_id;
        aVal = aParty.toLowerCase();
        bVal = bParty.toLowerCase();
      } else if (sortColumn === "amount") {
        aVal = parseFloat(a.amount);
        bVal = parseFloat(b.amount);
      } else if (sortColumn === "status") {
        aVal = a.status;
        bVal = b.status;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [transactions, sortColumn, sortDirection, currentUserUpiId]);

  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="ml-2 text-gray-400">⇅</span>;
    }
    return <span className="ml-2 text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSort("timestamp")}
            >
              Date & Time <SortIcon column="timestamp" />
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSort("type")}
            >
              Type <SortIcon column="type" />
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSort("users")}
            >
              Users <SortIcon column="users" />
            </th>
            <th
              className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSort("amount")}
            >
              Amount <SortIcon column="amount" />
            </th>
            <th
              className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSort("status")}
            >
              Status <SortIcon column="status" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((txn, idx) => {
            const isSent = txn.sender_upi_id === currentUserUpiId;
            const otherParty = isSent ? txn.receiver : txn.sender;
            const type = isSent ? "Sent" : "Received";
            const isSuccess = txn.status === "SUCCESS";
            const uniqueKey = `${txn.id || txn.timestamp}-${idx}`;

            return (
              <tr key={uniqueKey} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(txn.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${isSent ? '📤' : '📥'}`}></span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isSent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(otherParty)}
                      alt={otherParty}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white"
                    />
                    <span className="text-gray-700 font-medium truncate max-w-[180px]">
                      {otherParty}
                    </span>
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${isSent ? 'text-red-600' : 'text-green-600'}`}>{isSent ? '− ' : '+ '}₹{parseFloat(txn.amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isSuccess ? '● ' : '● '}{txn.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
