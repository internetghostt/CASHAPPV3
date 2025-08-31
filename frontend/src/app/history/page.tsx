"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Txn = {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  sender_id: number;
  recipient_id: number;
  type: "sent" | "received";
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiGet<{ transactions: Txn[] }>("/transactions/history.php");
        setTransactions(res.transactions);
      } catch {
        // ignore
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <div className="grid gap-3">
        {transactions.map((t) => (
          <div key={t.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold capitalize">{t.type}</div>
              <div className="text-xs text-[#777]">{new Date(t.created_at).toLocaleString()}</div>
            </div>
            <div className={`text-base font-bold ${t.type === "received" ? "text-green-600" : "text-red-600"}`}>
              {t.type === "received" ? "+" : "-"}${Number(t.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}