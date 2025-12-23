"use client"

import { useState, useMemo } from "react"

export default function TransactionTable({ transactions, currentUserUpiId }) {
  const [sortColumn, setSortColumn] = useState("timestamp")
  const [sortDirection, setSortDirection] = useState("desc")

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }
  const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let aVal, bVal

      if (sortColumn === "timestamp") {
        aVal = new Date(a.timestamp).getTime()
        bVal = new Date(b.timestamp).getTime()
      } else if (sortColumn === "type") {
        const aType = a.sender_upi_id === currentUserUpiId ? "Sent" : "Received"
        const bType = b.sender_upi_id === currentUserUpiId ? "Sent" : "Received"
        aVal = aType
        bVal = bType
      } else if (sortColumn === "users") {
        const aParty =
              a.sender_upi_id === currentUserUpiId
                ? a.receiver_upi_id
                : a.sender_upi_id

            const bParty =
              b.sender_upi_id === currentUserUpiId
                ? b.receiver_upi_id
                : b.sender_upi_id

            aVal = (aParty || "").toString().toLowerCase()
            bVal = (bParty || "").toString().toLowerCase()

      } else if (sortColumn === "amount") {
        aVal = Number.parseFloat(a.amount)
        bVal = Number.parseFloat(b.amount)
      } else if (sortColumn === "status") {
        aVal = a.status
        bVal = b.status
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [transactions, sortColumn, sortDirection, currentUserUpiId])

  if (transactions.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center">
        <div className="text-5xl sm:text-6xl mb-4">💳</div>
        <p className="text-gray-500 text-sm sm:text-base">No transactions yet</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Your transaction history will appear here</p>
      </div>
    )
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="ml-1 text-gray-400 text-xs">⇅</span>
    }
    return <span className="ml-1 text-indigo-600 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
  }

  return (
    <div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th
                className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("timestamp")}
              >
                Date & Time <SortIcon column="timestamp" />
              </th>
              <th
                className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("type")}
              >
                Type <SortIcon column="type" />
              </th>
              <th
                className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("users")}
              >
                Users <SortIcon column="users" />
              </th>
              <th
                className="px-4 lg:px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("amount")}
              >
                Amount <SortIcon column="amount" />
              </th>
              <th
                className="px-4 lg:px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("status")}
              >
                Status <SortIcon column="status" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((txn, idx) => {
              const isSent = txn.sender_upi_id === currentUserUpiId
              const otherParty = isSent ? txn.receiver : txn.sender
              const type = isSent ? "Sent" : "Received"
              const isSuccess = txn.status === "SUCCESS"
              const uniqueKey = `${txn.id || txn.timestamp}-${idx}`

              return (
                <tr key={uniqueKey} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                    {new Date(txn.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isSent ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      <span>{isSent ? "↑" : "↓"}</span>
                      {type}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(otherParty) || "/placeholder.svg"}
                        alt={otherParty}
                        className="w-8 h-8 rounded-full border border-gray-200 bg-white"
                      />
                      <span className="text-gray-700 font-medium truncate max-w-[180px]">{otherParty}</span>
                    </div>
                  </td>
                  <td
                    className={`px-4 lg:px-6 py-4 text-sm font-bold text-right ${isSent ? "text-red-600" : "text-green-600"}`}
                  >
                    {isSent ? "− " : "+ "}₹{Number.parseFloat(txn.amount).toFixed(2)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      <span className={isSuccess ? "text-green-500" : "text-red-500"}>●</span>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-100">
        {sortedTransactions.map((txn, idx) => {
          const isSent = txn.sender_upi_id === currentUserUpiId
          const otherParty = isSent ? txn.receiver : txn.sender
          const type = isSent ? "Sent" : "Received"
          const isSuccess = txn.status === "SUCCESS"
          const uniqueKey = `${txn.id || txn.timestamp}-${idx}`

          return (
            <div key={uniqueKey} className="p-4 hover:bg-gray-50 transition-colors">
              {/* Top row: User and Amount */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={getAvatarUrl(otherParty) || "/placeholder.svg"}
                    alt={otherParty}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{otherParty}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(txn.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-bold ${isSent ? "text-red-600" : "text-green-600"}`}>
                    {isSent ? "− " : "+ "}₹{Number.parseFloat(txn.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Bottom row: Type and Status */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isSent ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                >
                  <span>{isSent ? "↑" : "↓"}</span>
                  {type}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  <span className={isSuccess ? "text-green-500" : "text-red-500"}>●</span>
                  {txn.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
