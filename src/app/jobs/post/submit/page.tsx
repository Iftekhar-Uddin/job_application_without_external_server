"use client";

import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RootState, AppDispatch } from "@/redux/store";
import { clearDraftJob } from "@/redux/jobSlice/jobSlice";
import {
  CreditCard,
  Globe,
  ShieldCheck,
  SendHorizonal,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SubmitJobPage() {
  const draft = useSelector((s: RootState) => s.jobReducer.draft);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [mode, setMode] = useState<"idle" | "admin" | "stripe" | "ssl">("idle");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!draft) {
      router.push("/jobs");
    }
  }, [draft, router]);

  if (!draft) return null;

  const handleSendToAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/job/admin-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed");
      dispatch(clearDraftJob());
      router.push("/jobs?status=pending");
    } catch (err) {
      console.error(err);
      alert("Failed to send to admin");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (provider: "stripe" | "sslcommerz") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.url || data.GatewayPageURL) {
        dispatch(clearDraftJob());
        window.location.href = data.url ?? data.GatewayPageURL;
      } else {
        console.error(data);
        alert("Payment initiation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 sm:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Publish Your Job
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            Choose a publishing method to make your job post live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setMode("ssl")}
            className={`flex flex-col items-center justify-center gap-2 border rounded-xl p-5 transition-all duration-300 ${
              mode === "ssl"
                ? "ring-2 ring-emerald-500 bg-emerald-50"
                : "hover:bg-gray-50"
            }`}
          >
            <CreditCard size={28} className="text-emerald-600" />
            <div className="text-sm font-semibold text-gray-900">
              BD Payment (SSLCommerz)
            </div>
            <div className="text-xs text-gray-500 text-center">
              Pay securely with local gateway.
            </div>
          </button>

          <button
            onClick={() => setMode("stripe")}
            className={`flex flex-col items-center justify-center gap-2 border rounded-xl p-5 transition-all duration-300 ${
              mode === "stripe"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            <Globe size={28} className="text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">
              International Payment
            </div>
            <div className="text-xs text-gray-500 text-center">
              Checkout via Stripe.
            </div>
          </button>

          <button
            onClick={() => setMode("admin")}
            className={`flex flex-col items-center justify-center gap-2 border rounded-xl p-5 transition-all duration-300 ${
              mode === "admin"
                ? "ring-2 ring-orange-500 bg-orange-50"
                : "hover:bg-gray-50"
            }`}
          >
            <ShieldCheck size={28} className="text-orange-600" />
            <div className="text-sm font-semibold text-gray-900">
              Admin Approval
            </div>
            <div className="text-xs text-gray-500 text-center">
              Submit for manual review.
            </div>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode !== "idle" && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="mt-8 text-center"
            >
              {mode === "admin" && (
                <>
                  <p className="mb-3 text-sm text-gray-700">
                    Send this job to admin for review. It will be published once
                    approved.
                  </p>
                  <button
                    onClick={handleSendToAdmin}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-black transition-all duration-300 active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <SendHorizonal size={16} /> Send to Admin
                      </>
                    )}
                  </button>
                </>
              )}

              {mode === "stripe" && (
                <>
                  <p className="mb-3 text-sm text-gray-700">
                    You’ll be redirected to{" "}
                    <span className="text-blue-600 font-medium">Stripe</span>{" "}
                    for secure international checkout.
                  </p>
                  <button
                    onClick={() => handlePayment("stripe")}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-300 active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Processing
                      </>
                    ) : (
                      <>
                        <Globe size={16} /> Proceed to Stripe
                      </>
                    )}
                  </button>
                </>
              )}

              {mode === "ssl" && (
                <>
                  <p className="mb-3 text-sm text-gray-700">
                    You’ll be redirected to{" "}
                    <span className="text-emerald-600 font-medium">
                      SSLCommerz
                    </span>{" "}
                    to complete local payment.
                  </p>
                  <button
                    onClick={() => handlePayment("sslcommerz")}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all duration-300 active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Processing
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} /> Proceed to SSLCommerz
                      </>
                    )}
                  </button>
                </>
              )}

              {!loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500"
                >
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span>Secure transaction ensured.</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

