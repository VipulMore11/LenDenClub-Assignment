import React from "react";

export default function TransactionTable({ transactions, currentUserEmail }) {
  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Other Party</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => {
            const isSent = txn.sender === currentUserEmail;
            const otherParty = isSent ? txn.receiver : txn.sender;
            const type = isSent ? "Sent" : "Received";
            const isSuccess = txn.status === "SUCCESS";

            return (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(txn.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${isSent ? '📤' : '📥'}`}></span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isSent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{otherParty}</td>
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
