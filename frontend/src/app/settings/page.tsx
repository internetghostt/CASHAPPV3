"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPut } from "@/lib/api";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  const onSave = async () => {
    setSaving(true);
    try {
      await apiPut<{ status: string }, { name?: string; email?: string; phone?: string }>("/auth/profile_update.php", {
        name,
        email,
        phone,
      });
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="card p-4">
        <div className="text-sm text-[#666] mb-2">Cash Card</div>
        <div className="bg-[var(--primary)] text-white rounded-2xl p-6">
          <div className="text-xs opacity-80">Balance</div>
          <div className="text-3xl font-extrabold">${Number(user?.balance ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="text-base font-semibold">Profile</div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="button-primary disabled:opacity-60" disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}