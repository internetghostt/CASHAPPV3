"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SendPage() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!recipient || isNaN(amt) || amt <= 0) {
      setError("Enter valid recipient and amount");
      return;
    }
    try {
      await apiPost<{ status: string; balance: number }, { recipient: string; amount: number }>("/transactions/send.php", { recipient, amount: amt });
      router.replace("/");
    } catch {
      setError("Transfer failed");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Send Money</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <input className="input text-center text-3xl" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input className="input" placeholder="Email or Account Number" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="button-primary w-full">Send</button>
      </form>
    </div>
  );
}