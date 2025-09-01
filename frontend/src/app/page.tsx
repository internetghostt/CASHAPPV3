"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Txn = {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  sender_id: number;
  recipient_id: number;
  type: "sent" | "received";
};

function avatarColorFromName(name: string): string {
  const colors = ["#FF6B6B", "#FFD166", "#06D6A0", "#4ECDC4", "#82AAFF", "#B388FF", "#F78FB3", "#C3F584"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}
function generateRoutingNo(seed: string): string {
  if (!seed) return "021000021"; // default-looking routing number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const num = Math.abs(hash) % 1000000000;
  return num.toString().padStart(9, "0");
}
export default function Home() {
  const { user, token, refresh, logout, isReady } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const isFrozen = !!user?.is_frozen;
  const balance = Number(user?.balance ?? 0);
  const initial = (user?.name?.[0] || "?").toUpperCase();
  const avatarBg = useMemo(() => avatarColorFromName(user?.name || "?"), [user?.name]);
  const routingNo = useMemo(() => generateRoutingNo(user?.account_number || ""), [user?.account_number]);

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      router.replace("/login/");
      return;
    }
    (async () => {
      await refresh();
      try {
        const res = await apiGet<{ transactions: Txn[] }>("/transactions/history.php");
        setTransactions(res.transactions);
      } catch {
        // ignore
      }
    })();
  }, [isReady, token, refresh, router]);

  const handleProtectedClick = (href?: string) => {
    if (isFrozen) {
      alert("Please contact support");
      return;
    }
    if (href) router.push(href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isFrozen && (
        <div className="marquee py-2 text-sm" style={{ backgroundColor: "#f0c0c7", color: "#000" }}>
          <div className="marquee-inner" style={{ animationDuration: "40s" }}>
            {`Dear ${user?.name ?? "User"}, your account have violated company policy. Your account has been frozen, please contact support. `}
            {`Dear ${user?.name ?? "User"}, your account have violated company policy. Your account has been frozen, please contact support. `}
          </div>
      </div>
      )}

      <header className="p-5 flex items-center justify-between">
        <div>
            <div className="text-xs text-[#666]">Balance</div>
            <div className="text-5xl font-extrabold text-black">${balance.toFixed(2)}</div>
            <div className="text-xs text-[#666] mt-1">Acct No: {user?.account_number ?? "—"} • Routing No: {routingNo}</div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-10 w-10 rounded-full text-white font-bold flex items-center justify-center"
            style={{ backgroundColor: avatarBg }}
            aria-label="Profile"
            title="Profile"
          >
            {initial}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-10">
              {user?.is_admin && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#f6f6f6]"
                  onClick={() => {
                    router.push("/admin/");
                    setMenuOpen(false);
                  }}
                >
                  Admin Dashboard
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2 hover:bg-[#f6f6f6]"
                onClick={() => {
                  if (isFrozen) return alert("Please contact support");
                  router.push("/settings/");
                  setMenuOpen(false);
                }}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-[#fef2f2]"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 space-y-6">
        <section className="grid grid-cols-3 gap-3">
          <button onClick={() => handleProtectedClick()} className="card p-4 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-black font-bold flex items-center justify-center">+</div>
            <div className="text-xs">Add Money</div>
          </button>
          <button onClick={() => handleProtectedClick()} className="card p-4 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">-</div>
            <div className="text-xs">Withdraw</div>
          </button>
          <button onClick={() => handleProtectedClick()} className="card p-4 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">$</div>
            <div className="text-xs">Paychecks</div>
          </button>
          <button onClick={() => handleProtectedClick()} className="card p-4 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">%</div>
            <div className="text-xs">Savings</div>
          </button>
          <button onClick={() => handleProtectedClick()} className="card p-4 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">₿</div>
            <div className="text-xs">Bitcoin</div>
          </button>
          <button onClick={() => handleProtectedClick()} className="card p-4 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">S</div>
            <div className="text-xs">Stocks</div>
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className={`card p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === "received" ? "bg-gray-100 text-gray-800" : "bg-gray-200 text-gray-600"}`}>
                    {t.type === "received" ? "+" : "-"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold capitalize">{t.type}</div>
                    <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className={`text-base font-bold ${t.type === "received" ? "text-black" : "text-gray-600"}`}>
                  {t.type === "received" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#eaeaea]">
  <div className="mx-auto max-w-md grid grid-cols-5 py-3 text-sm text-gray-600">
    <button onClick={() => router.push("/")} className="text-center">
      <img src="https://img.icons8.com/?size=100&id=8xhovyHdOQzF&format=png&color=000000" alt="Home" className="mx-auto h-6 w-6 object-contain" />
      <div>Home</div>
    </button>
    <button onClick={() => handleProtectedClick("/send/")} className="text-center" aria-disabled={isFrozen} style={isFrozen ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
      <img src="https://img.icons8.com/?size=100&id=LTvptsXhcJki&format=png&color=000000" alt="Send" className="mx-auto h-6 w-6 object-contain" />
      <div>Send</div>
    </button>
    <button onClick={() => handleProtectedClick("/dollar/")} className="text-center" aria-disabled={isFrozen} style={isFrozen ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
      <img src="https://img.icons8.com/?size=100&id=u1qIIHcJjjJ0&format=png&color=000000" alt="Dollar" className="mx-auto h-6 w-6 object-contain" />
      <div>Add Money</div>
    </button>
    <button onClick={() => handleProtectedClick("/search/")} className="text-center" aria-disabled={isFrozen} style={isFrozen ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
      <img src="https://img.icons8.com/?size=100&id=WwWusvLMTFd7&format=png&color=000000" alt="Search" className="mx-auto h-6 w-6 object-contain" />
      <div>Search</div>
    </button>
    <button onClick={() => router.push("/history/")} className="text-center">
      <img src="https://img.icons8.com/?size=100&id=4i5bTF9azXVR&format=png&color=000000" alt="History" className="mx-auto h-6 w-6 object-contain" />
      <div>History</div>
    </button>
  </div>
</nav>
    </div>
  );
}