"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut, apiPatch } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
  account_number: string;
  date_of_birth: string | null;
  occupation: string | null;
  contract_start_date: string | null;
  contract_expiry_date: string | null;
  kyc_verified: number;
  bank_verified: number;
  is_admin: number;
  is_frozen: number;
  created_at: string;
};

export default function AdminPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    date_of_birth: "",
    occupation: "",
    balance: "0",
    contract_start_date: "",
    contract_expiry_date: "",
    kyc_verified: false,
    bank_verified: false,
    is_admin: false,
  });

  useEffect(() => {
    if (!isReady) return;
    if (!user?.is_admin) {
      router.replace("/");
      return;
    }
    loadUsers();
  }, [isReady, user, router]);

  const loadUsers = async () => {
    try {
      const res = await apiGet<{ users: User[] }>("/admin/list_users.php");
      setUsers(res.users);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/admin/create_user.php", {
        ...formData,
        balance: parseFloat(formData.balance),
        kyc_verified: formData.kyc_verified ? 1 : 0,
        bank_verified: formData.bank_verified ? 1 : 0,
        is_admin: formData.is_admin ? 1 : 0,
      });
      setShowCreateForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        date_of_birth: "",
        occupation: "",
        balance: "0",
        contract_start_date: "",
        contract_expiry_date: "",
        kyc_verified: false,
        bank_verified: false,
        is_admin: false,
      });
      await loadUsers();
    } catch (error) {
      alert("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      await apiPut("/admin/update_user.php", {
        id: selectedUser.id,
        ...formData,
        balance: parseFloat(formData.balance),
        kyc_verified: formData.kyc_verified ? 1 : 0,
        bank_verified: formData.bank_verified ? 1 : 0,
        is_admin: formData.is_admin ? 1 : 0,
      });
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (userId: number, currentFrozenStatus: number) => {
    try {
      await apiPatch("/admin/toggle_freeze.php", {
        id: userId,
        is_frozen: currentFrozenStatus ? 0 : 1,
      });
      await loadUsers();
    } catch (error) {
      alert("Failed to toggle freeze status");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "https://devv.mugcafee.com/backend/api"}/admin/delete_user.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: userId }),
      });
      await loadUsers();
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const openEditForm = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      date_of_birth: user.date_of_birth || "",
      occupation: user.occupation || "",
      balance: user.balance.toString(),
      contract_start_date: user.contract_start_date || "",
      contract_expiry_date: user.contract_expiry_date || "",
      kyc_verified: !!user.kyc_verified,
      bank_verified: !!user.bank_verified,
      is_admin: !!user.is_admin,
    });
  };

  if (!user?.is_admin) {
    return <div className="min-h-screen p-6">Access denied</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="button-primary"
        >
          Create User
        </button>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Balance</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Verification</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.occupation}</div>
                  </td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 font-mono">${u.balance.toFixed(2)}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.is_frozen ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {u.is_frozen ? 'Frozen' : 'Active'}
                    </span>
                    {u.is_admin ? <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">Admin</span> : null}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <span className={u.kyc_verified ? "text-green-600" : "text-gray-400"}>
                        {u.kyc_verified ? "✅" : "⚫"} KYC
                      </span>
                      <span className={u.bank_verified ? "text-green-600" : "text-gray-400"}>
                        {u.bank_verified ? "✅" : "⚫"} Bank
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(u)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleFreeze(u.id, u.is_frozen)}
                        className={`hover:underline text-xs ${u.is_frozen ? 'text-green-600' : 'text-orange-600'}`}
                      >
                        {u.is_frozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input
                className="input"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                className="input"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
              <input
                className="input"
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <input
                className="input"
                placeholder="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                required
              />
              <input
                className="input"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                required
              />
              <input
                className="input"
                placeholder="Initial Balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: e.target.value})}
              />
              <input
                className="input"
                placeholder="Contract Start Date"
                type="date"
                value={formData.contract_start_date}
                onChange={(e) => setFormData({...formData, contract_start_date: e.target.value})}
              />
              <input
                className="input"
                placeholder="Contract Expiry Date"
                type="date"
                value={formData.contract_expiry_date}
                onChange={(e) => setFormData({...formData, contract_expiry_date: e.target.value})}
              />
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.kyc_verified}
                    onChange={(e) => setFormData({...formData, kyc_verified: e.target.checked})}
                  />
                  <span className="text-sm">KYC Verified</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.bank_verified}
                    onChange={(e) => setFormData({...formData, bank_verified: e.target.checked})}
                  />
                  <span className="text-sm">Bank Verified</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
                  />
                  <span className="text-sm">Admin User</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 button-primary disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit User: {selectedUser.name}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input
                className="input"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input
                className="input"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <input
                className="input"
                placeholder="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
              <input
                className="input"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
              />
              <input
                className="input"
                placeholder="Balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: e.target.value})}
              />
              <input
                className="input"
                placeholder="Contract Start Date"
                type="date"
                value={formData.contract_start_date}
                onChange={(e) => setFormData({...formData, contract_start_date: e.target.value})}
              />
              <input
                className="input"
                placeholder="Contract Expiry Date"
                type="date"
                value={formData.contract_expiry_date}
                onChange={(e) => setFormData({...formData, contract_expiry_date: e.target.value})}
              />
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.kyc_verified}
                    onChange={(e) => setFormData({...formData, kyc_verified: e.target.checked})}
                  />
                  <span className="text-sm">KYC Verified</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.bank_verified}
                    onChange={(e) => setFormData({...formData, bank_verified: e.target.checked})}
                  />
                  <span className="text-sm">Bank Verified</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
                  />
                  <span className="text-sm">Admin User</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 button-primary disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}