import React from "react";

export default function TransactionTable({ transactions, currentUserEmail }) {
  if (transactions.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Transaction History</h2>
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Transaction History</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date & Time</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Other Party</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, idx) => {
              const isSent = txn.sender === currentUserEmail;
              console.log("Transaction:", txn, "Is Sent:", isSent, "Current User:", currentUserEmail, "Sender:", txn.sender, "Receiver:", txn.receiver);
              const otherParty = isSent ? txn.receiver : txn.sender;
              const type = isSent ? "Sent" : "Received";

              return (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(txn.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${isSent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{type}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{otherParty}</td>
                  <td className={`px-4 py-3 text-sm text-right font-semibold ${isSent ? 'text-red-600' : 'text-green-600'}`}>{isSent ? '−' : '+'} ₹{parseFloat(txn.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-sm"><span className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full" style={{backgroundColor: txn.status === 'SUCCESS' ? '#2e7d32' : '#e65100'}}>{txn.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
