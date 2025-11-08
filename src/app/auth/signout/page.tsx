"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Option 1: Using NextAuth signOut (recommended)
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });

      // Option 2: Using custom API (if you need additional logic)
      // await fetch('/api/auth/signout', { method: 'POST' });
      // router.push('/');
      // router.refresh(); // Refresh to update auth state
    } catch (error) {
      console.error('Signout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 hover:shadow text-sm transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </button>
  );
}