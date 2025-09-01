"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPut } from "@/lib/api";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractExpiryDate, setContractExpiryDate] = useState("");
  const [kycVerified, setKycVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const isFrozen = !!user?.is_frozen;

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
      setContractStartDate(user.contract_start_date || "");
      setContractExpiryDate(user.contract_expiry_date || "");
      setKycVerified(!!user.kyc_verified);
    }
  }, [user]);

  const onSave = async () => {
    if (isFrozen) return;
    setSaving(true);
    try {
      await apiPut<{ status: string }, { name?: string; email?: string; phone?: string; contract_start_date?: string; contract_expiry_date?: string; kyc_verified?: number }>("/auth/profile_update.php", {
        name,
        email,
        phone,
        contract_start_date: contractStartDate,
        contract_expiry_date: contractExpiryDate,
        kyc_verified: kycVerified ? 1 : 0,
      });
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="card p-4">
        <div className="text-sm text-gray-600 mb-2">Cash Card</div>
        <div className="bg-black text-white rounded-2xl p-6">
          <div className="text-xs opacity-80">Balance</div>
          <div className="text-3xl font-extrabold">${Number(user?.balance ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="text-base font-semibold">Personal Information</div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input 
              className={`input ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={isFrozen}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input 
              className={`input ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFrozen}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input 
              className={`input ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              disabled={isFrozen}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
            <input 
              className="input bg-gray-100 cursor-not-allowed" 
              value={user?.date_of_birth || ""} 
              disabled
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Occupation</label>
            <input 
              className="input bg-gray-100 cursor-not-allowed" 
              value={user?.occupation || ""} 
              disabled
            />
          </div>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="text-base font-semibold">Contract Information</div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Contract Start Date</label>
            <input 
              className={`input ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
              type="date"
              value={contractStartDate} 
              onChange={(e) => setContractStartDate(e.target.value)}
              disabled={isFrozen}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Contract Expiry Date</label>
            <input 
              className={`input ${isFrozen ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
              type="date"
              value={contractExpiryDate} 
              onChange={(e) => setContractExpiryDate(e.target.value)}
              disabled={isFrozen}
            />
          </div>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="text-base font-semibold">Verification Status</div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm">KYC (ID)</span>
              <span className={kycVerified ? "text-black" : "text-gray-400"}>
                {kycVerified ? "✅" : "●"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={kycVerified}
                onChange={(e) => setKycVerified(e.target.checked)}
                disabled={isFrozen}
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${kycVerified ? 'bg-black' : 'bg-gray-300'} ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${kycVerified ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
              <span className="text-sm">Bank</span>
              {user?.bank_verified ? <span className="text-black">✅</span> : null}
            </div>
          </div>
        </div>
      </div>

      {!isFrozen && (
        <button 
          className="button-primary w-full disabled:opacity-60" 
          disabled={saving} 
          onClick={onSave}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}

      {isFrozen && (
        <div className="text-center text-sm text-gray-800 bg-gray-100 p-3 rounded-xl">
          Account is frozen. Settings cannot be modified.
        </div>
      )}
    </div>
  );
}