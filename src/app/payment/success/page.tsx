"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  const sessionId = search.get("session_id");
  const paymentStatus = search.get("payment");
  const jobId = search.get("jobId");

  console.log("🔍 Page loaded with:", { paymentStatus, jobId, sessionId, hasAutoFetched });

  const fetchPayment = async () => {
    try {
      console.log("🔄 Fetching payment data...");
      setLoading(true);
      let paymentData;

      if (sessionId) {
        const res = await fetch(`/api/payment/stripe/${sessionId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Stripe payment not found");
        }
        paymentData = await res.json();
      } else if (jobId) {
        console.log("📞 Calling SSLCOMMERZ API for jobId:", jobId);
        const res = await fetch(`/api/payment/sslcommerz/${jobId}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "SSLCOMMERZ payment not found");
        }
        paymentData = await res.json();
        console.log("✅ SSLCOMMERZ payment data received:", paymentData);
      } else {
        throw new Error("No valid payment identifier found");
      }
      
      if (!paymentData) {
        throw new Error("No payment data received from server");
      }
      
      setPayment(paymentData);
      setError(null);
    } catch (err: any) {
      console.error("❌ Payment fetch error:", err);
      setError(err.message || "Failed to load payment details.");
      
      // Auto-retry for SSLCOMMERZ (payment might not be immediately available)
      if (jobId && retryCount < 3) {
        console.log(`🔄 Auto-retrying in 2 seconds... (${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
        return; // Don't set loading to false yet
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎯 useEffect triggered:", { paymentStatus, jobId, sessionId, retryCount, hasAutoFetched });

    // If we already have payment data, don't fetch again
    if (payment) {
      console.log("✅ Already have payment data, skipping fetch");
      return;
    }

    // Handle error cases immediately
    if (paymentStatus === "invalid" || paymentStatus === "error") {
      console.log("🚨 Error status detected:", paymentStatus);
      setLoading(false);
      setError(paymentStatus === "invalid" ? "Payment not found or expired." : "Payment processing error.");
      return;
    }

    // AUTO-FETCH: If we have success parameters, fetch immediately
    if ((paymentStatus === "success" || jobId) && !hasAutoFetched) {
      console.log("🚀 Auto-fetching payment data on page load");
      setHasAutoFetched(true);
      fetchPayment();
    } else if (retryCount > 0 && !payment) {
      // Retry logic
      console.log("🔄 Retry fetch triggered");
      fetchPayment();
    } else if (!paymentStatus && !jobId && !sessionId) {
      // No parameters - show error
      console.log("⏹️ No payment parameters found");
      setLoading(false);
      setError("No payment information found. Please check your payment confirmation email.");
    }
  }, [paymentStatus, jobId, sessionId, retryCount, hasAutoFetched, payment]);

  // Force fetch on component mount if we have parameters
  useEffect(() => {
    if ((paymentStatus === "success" || jobId) && !hasAutoFetched && !payment) {
      console.log("🎯 Component mount - triggering auto-fetch");
      setHasAutoFetched(true);
      fetchPayment();
    }
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchPayment();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {retryCount > 0 ? `Processing Payment... (Attempt ${retryCount + 1}/3)` : "Processing Your Payment..."}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Please wait while we confirm your payment details.
          </p>
          <div className="text-xs text-slate-400">
            Job ID: {jobId || "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {error?.includes("not found") ? "Payment Not Found" : "Payment Processing Issue"}
          </h2>
          <p className="text-sm text-slate-500 mb-2">
            {error || "We're having trouble loading your payment details."}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            {jobId && `Job ID: ${jobId}`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
            >
              <RefreshCw size={14} /> Try Again
            </button>
            <button
              onClick={handleGoToDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition"
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition"
            >
              <ArrowLeft size={14} /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  const { job } = payment;
  const displayProvider = payment.provider === "SSLCOMMERZ" ? "SSLCOMMERZ" : "STRIPE";
  const transactionId = payment.tranId || sessionId;

  console.log("🎉 Rendering success page with payment:", payment);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

        <div className="border-b border-slate-100 px-6 py-4 bg-white">
          <h1 className="text-lg md:text-xl font-semibold text-slate-800">
            Payment Confirmed ✅
          </h1>
          <span className="text-xs font-medium text-slate-500">
            {new Date(payment.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">

          {/* Success Message Section */}
          <section className="flex flex-col items-center justify-center text-center gap-6">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 p-6 shadow-xl"
            >
              <CheckCircle size={72} color="white" strokeWidth={2} />
            </motion.div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                Payment Successful!
              </h2>
              <p className="text-sm text-slate-500">
                Your job posting is now live and visible to candidates.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
                Amount:{" "}
                <span className="font-semibold text-slate-700">
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
                Via:{" "}
                <span className="font-semibold text-slate-700">{displayProvider}</span>
              </div>
            </div>

            {transactionId && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                <p className="text-sm font-mono text-slate-700 break-all">
                  {transactionId}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-xs">
              <Link
                href={`/jobs/${job.id}`}
                className="flex-1 px-4 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                View Job <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </section>

          {/* Job Details Section */}
          <aside className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              {job.logo ? (
                <Image
                  src={job.logo}
                  alt={job.company}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover border-2 border-slate-300"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {job.company?.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-lg truncate">{job.title}</h3>
                <p className="text-slate-600 truncate">{job.company}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-medium text-slate-600">Location:</span>
                <span className="text-slate-800">{job.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-medium text-slate-600">Job Type:</span>
                <span className="text-slate-800">{job.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-medium text-slate-600">Status:</span>
                <span className="font-semibold text-green-600">{payment.status}</span>
              </div>
              {job.website && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-600">Website:</span>
                  <a
                    href={job.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline truncate max-w-[150px]"
                  >
                    {job.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Need assistance?{" "}
                <a
                  href="mailto:support@jobboard.com"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </aside>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500 text-center bg-slate-50">
          Secured by <span className="font-semibold">SSLCOMMERZ</span> • Professional Job Board Platform
        </div>
      </div>
    </main>
  );
}























// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

// type PaymentWithJob = {
//   id: string;
//   tranId: string | null;
//   amount: number;
//   currency: string;
//   provider: string;
//   status: string;
//   createdAt: string;
//   job: {
//     id: string;
//     title: string;
//     company: string;
//     logo?: string | null;
//     website?: string | null;
//     location: string;
//     type: string;
//   };
// };


// export default function PaymentSuccessPage() {
//   const router = useRouter();
//   const search = useSearchParams();
//   const [payment, setPayment] = useState<PaymentWithJob | null>(null);
//   const [loading, setLoading] = useState(true);
//   const tranId = search.get("session_id");

//   useEffect(() => {
//     if (!tranId) return;
//     (async () => {
//       try {
//         const res = await fetch(`/api/payment/stripe/${tranId}`);
//         if (!res.ok) throw new Error("Payment not found");
//         const data = await res.json();
//         setPayment(data);
//       } catch (err) {
//         console.error("Payment fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [tranId]);


//   if (loading)
//     return (
//       <div className="max-w-7xl min-h-320px flex items-center justify-center bg-slate-50">
//         <div className="animate-pulse space-y-4 w-full max-w-md p-6 bg-white rounded-xl shadow-sm">
//           <div className="h-10 w-32 bg-slate-200 rounded-md mx-auto" />
//           <div className="h-4 bg-slate-100 rounded-md w-3/4 mx-auto" />
//           <div className="h-4 bg-slate-100 rounded-md w-1/2 mx-auto" />
//           <div className="h-24 bg-slate-100 rounded-lg" />
//         </div>
//       </div>
//     );

//   if (!payment)
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-slate-600">
//         <p className="text-sm mb-3">Payment not found or expired.</p>
//         <button
//           onClick={() => router.push("/")}
//           className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition"
//         >
//           <ArrowLeft size={14} /> Back Home
//         </button>
//       </div>
//     );

//   const { job } = payment;
//   const provider =
//     payment.provider === "sslcommerz" ? "SSLCOMMERZ" : "Stripe";

//   return (
//     <main className="max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-center bg-white/70 rounded-md sm:rounded-lg">
//       <div className="bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 w-full rounded-2xl shadow-lg border border-slate-100 overflow-hidden">

//         <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
//           <h1 className="text-lg md:text-xl font-semibold text-slate-800">
//             Payment Summary
//           </h1>
//           <span className="text-xs font-medium text-slate-500">
//             {new Date(payment.createdAt).toLocaleString()}
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">

//           <section className="flex flex-col items-center justify-center text-center gap-5">
//             <motion.div
//               initial={{ scale: 0.6, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               className="rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 p-5 shadow-lg"
//             >
//               <CheckCircle size={64} color="white" strokeWidth={2} />
//             </motion.div>

//             <div>
//               <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
//                 Payment Successful!
//               </h2>
//               <p className="mt-2 text-sm text-slate-500">
//                 Your transaction was completed via{" "}
//                 <span className="font-medium text-emerald-600">{provider}</span>.
//               </p>
//             </div>

//             <div className="flex flex-wrap justify-center gap-3 mt-4">
//               <div className="px-3 py-1.5 bg-slate-100 rounded-md text-sm">
//                 Amount:{" "}
//                 <span className="font-semibold text-slate-700">
//                   {payment.amount} {payment.currency}
//                 </span>
//               </div>
//               <div className="px-3 py-1.5 bg-slate-100 rounded-md text-sm">
//                 Provider:{" "}
//                 <span className="font-semibold text-slate-700">{provider}</span>
//               </div>
//             </div>

//             <p className="mt-4 text-xs text-slate-500 break-all">
//               Transaction ID:{" "}
//               <span className="font-semibold text-slate-700">
//                 {payment.tranId}
//               </span>
//             </p>

//             <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full sm:w-auto justify-center">
//               <Link
//                 href={`/jobs/${job.id}`}
//                 className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium shadow-sm flex items-center justify-center gap-1"
//               >
//                 View Job <ArrowRight size={14} />
//               </Link>
//               <Link
//                 href="/dashboard"
//                 className="px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center justify-center gap-1"
//               >
//                 Go to Dashboard
//               </Link>
//             </div>
//           </section>


//           <aside className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-100">
//             <div className="flex items-center gap-3 mb-4">
//               {job.logo ? (
//                 <Image
//                   src={job.logo}
//                   alt={job.company}
//                   width={56}
//                   height={56}
//                   className="rounded-md object-cover border"
//                 />
//               ) : (
//                 <div className="w-14 h-14 rounded-md bg-slate-200 flex items-center justify-center text-lg font-bold text-orange-600">
//                   {job.company?.charAt(0)}
//                 </div>
//               )}
//               <div>
//                 <h3 className="font-semibold text-slate-800">{job.title}</h3>
//                 <p className="text-sm text-slate-500">{job.company}</p>
//               </div>
//             </div>

//             <div className="space-y-1 text-sm text-slate-700">
//               <p>
//                 <strong>Location:</strong> {job.location}
//               </p>
//               <p>
//                 <strong>Type:</strong> {job.type}
//               </p>
//               <p>
//                 <strong>Website:</strong>{" "}
//                 {job.website ? (
//                   <a
//                     href={job.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-orange-600 hover:underline break-all"
//                   >
//                     {job.website}
//                   </a>
//                 ) : (
//                   "—"
//                 )}
//               </p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 <span className="font-medium text-green-600">
//                   {payment.status}
//                 </span>
//               </p>
//             </div>

//             <div className="mt-5 text-xs text-slate-500 border-t border-slate-200 pt-3">
//               Need help? Contact{" "}
//               <a
//                 href="mailto:support@yourdomain.com"
//                 className="text-orange-600 underline"
//               >
//                 support@yourdomain.com
//               </a>
//               .
//             </div>
//           </aside>
//         </div>

//         <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500 text-center bg-slate-50">
//           Powered by <span className="font-semibold">SSLCOMMERZ</span> &{" "}
//           <span className="font-semibold">Stripe</span> · Secure Payment Gateway
//         </div>
//       </div>
//     </main>
//   );
// }

