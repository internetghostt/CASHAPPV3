"use client";
import { useAuth } from "@/context/AuthContext";

export default function DollarPage() {
  const { user } = useAuth();
  const isFrozen = !!user?.is_frozen;

  if (isFrozen) {
    return (
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-2">Dollar</h1>
        <div className="text-sm text-gray-600">Your account is frozen. This feature is unavailable.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Dollar</h1>
      <div className="text-sm text-gray-600">Coming soon.</div>
    </div>
  );
}
