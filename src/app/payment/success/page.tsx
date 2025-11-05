"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

type PaymentWithJob = {
  id: string;
  tranId: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    logo?: string | null;
    website?: string | null;
    location: string;
    type: string;
  };
};

export default function PaymentSuccessPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [payment, setPayment] = useState<PaymentWithJob | null>(null);
  const [loading, setLoading] = useState(true);
  const tranId = search.get("tranId");

  useEffect(() => {
    if (!tranId) return;
    (async () => {
      try {
        const res = await fetch(`/api/stripe/${tranId}`);
        if (!res.ok) throw new Error("Payment not found");
        const data = await res.json();
        setPayment(data);
      } catch (err) {
        console.error("Payment fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [tranId]);


  if (loading)
    return (
      <div className="max-w-7xl min-h-320px flex items-center justify-center bg-slate-50">
        <div className="animate-pulse space-y-4 w-full max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="h-10 w-32 bg-slate-200 rounded-md mx-auto" />
          <div className="h-4 bg-slate-100 rounded-md w-3/4 mx-auto" />
          <div className="h-4 bg-slate-100 rounded-md w-1/2 mx-auto" />
          <div className="h-24 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );

  if (!payment)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-600">
        <p className="text-sm mb-3">Payment not found or expired.</p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition"
        >
          <ArrowLeft size={14} /> Back Home
        </button>
      </div>
    );

  const { job } = payment;
  const provider =
    payment.provider === "sslcommerz" ? "SSLCOMMERZ" : "Stripe";

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-center bg-white/70 rounded-md sm:rounded-lg">
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 w-full rounded-2xl shadow-lg border border-slate-100 overflow-hidden">

        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold text-slate-800">
            Payment Summary
          </h1>
          <span className="text-xs font-medium text-slate-500">
            {new Date(payment.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">

          <section className="flex flex-col items-center justify-center text-center gap-5">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 p-5 shadow-lg"
            >
              <CheckCircle size={64} color="white" strokeWidth={2} />
            </motion.div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                Payment Successful!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your transaction was completed via{" "}
                <span className="font-medium text-emerald-600">{provider}</span>.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <div className="px-3 py-1.5 bg-slate-100 rounded-md text-sm">
                Amount:{" "}
                <span className="font-semibold text-slate-700">
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 rounded-md text-sm">
                Provider:{" "}
                <span className="font-semibold text-slate-700">{provider}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 break-all">
              Transaction ID:{" "}
              <span className="font-semibold text-slate-700">
                {payment.tranId}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full sm:w-auto justify-center">
              <Link
                href={`/jobs/${job.id}`}
                className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium shadow-sm flex items-center justify-center gap-1"
              >
                View Job <ArrowRight size={14} />
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center justify-center gap-1"
              >
                Go to Dashboard
              </Link>
            </div>
          </section>


          <aside className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              {job.logo ? (
                <Image
                  src={job.logo}
                  alt={job.company}
                  width={56}
                  height={56}
                  className="rounded-md object-cover border"
                />
              ) : (
                <div className="w-14 h-14 rounded-md bg-slate-200 flex items-center justify-center text-lg font-bold text-orange-600">
                  {job.company?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-slate-800">{job.title}</h3>
                <p className="text-sm text-slate-500">{job.company}</p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-slate-700">
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <p>
                <strong>Type:</strong> {job.type}
              </p>
              <p>
                <strong>Website:</strong>{" "}
                {job.website ? (
                  <a
                    href={job.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline break-all"
                  >
                    {job.website}
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-medium text-green-600">
                  {payment.status}
                </span>
              </p>
            </div>

            <div className="mt-5 text-xs text-slate-500 border-t border-slate-200 pt-3">
              Need help? Contact{" "}
              <a
                href="mailto:support@yourdomain.com"
                className="text-orange-600 underline"
              >
                support@yourdomain.com
              </a>
              .
            </div>
          </aside>
        </div>

        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500 text-center bg-slate-50">
          Powered by <span className="font-semibold">SSLCOMMERZ</span> &{" "}
          <span className="font-semibold">Stripe</span> · Secure Payment Gateway
        </div>
      </div>
    </main>
  );
}

