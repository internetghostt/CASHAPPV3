"use client";
import { useAuth } from "@/context/AuthContext";

export default function SearchPage() {
  const { user } = useAuth();
  const isFrozen = !!user?.is_frozen;

  if (isFrozen) {
    return (
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-2">Search</h1>
        <div className="text-sm text-red-600">Your account is frozen. This feature is unavailable.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="text-sm text-[#666]">Coming soon.</div>
    </div>
  );
}
