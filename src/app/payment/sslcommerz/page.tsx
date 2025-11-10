// app/payment/sslcommerz/page.tsx
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Clock
} from "lucide-react";


function PaymentStatusContent({ paymentStatus, jobId, tranId }: {  paymentStatus: string | null; jobId: string | null; tranId: string | null}) {
  const getNotificationConfig = (status: string | null) => {

    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          title: "Payment Successful!",
          message: "Your job posting has been published successfully.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "failed":
        return {
          icon: XCircle,
          title: "Payment Failed",
          message: "Your payment was not completed. Please try again.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "cancelled":
        return {
          icon: Info,
          title: "Payment Cancelled",
          message: "You cancelled the payment process.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "invalid":
        return {
          icon: AlertCircle,
          title: "Invalid Payment",
          message: "The payment session was invalid or expired.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "error":
        return {
          icon: XCircle,
          title: "Payment Error",
          message: "An unexpected error occurred. Please contact support.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "pending":
        return {
          icon: Clock,
          title: "Pending Approval",
          message: "Your job has been submitted for admin approval.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      default:
        return null;
    }
  };

  const notification = getNotificationConfig(paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {notification ? (
            <>
              <notification.icon className={`h-16 w-16 mx-auto ${notification.color} mb-4`} />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {notification.title}
              </h1>
              <p className="text-gray-600 mb-6">
                {notification.message}
              </p>
              
              {jobId && paymentStatus === "success" && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Job ID</p>
                  <p className="font-mono text-lg font-semibold">{jobId}</p>
                </div>
              )}
              
              {tranId && (paymentStatus === "failed" || paymentStatus === "cancelled") && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-lg font-semibold">{tranId}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {paymentStatus === "success" && (
                  <>
                    <button
                      onClick={() => window.location.href = `/jobs/${jobId}`}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View Job Posting
                    </button>
                    <button
                      onClick={() => window.location.href = "/jobs/post"}
                      className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Post Another Job
                    </button>
                  </>
                )}
                
                {(paymentStatus === "failed" || paymentStatus === "error") && (
                  <>
                    <button
                      onClick={() => window.location.href = "/jobs/post"}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => window.location.href = "/contact"}
                      className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Contact Support
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => window.location.href = "/jobs"}
                  className="border border-gray-600 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            </>
          ) : (
            <>
              <Info className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Status
              </h1>
              <p className="text-gray-600 mb-6">
                No payment status information available.
              </p>
              <button
                onClick={() => window.location.href = "/jobs"}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Jobs
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default async function PaymentStatusPage( { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>} ) {

  const params = await searchParams;
  const paymentStatus = Array.isArray(params.payment) ? params.payment[0] : params.payment;
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const tranId = Array.isArray(params.tranId) ? params.tranId[0] : params.tranId;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentStatusContent 
        paymentStatus={paymentStatus || null}
        jobId={jobId || null}
        tranId={tranId || null}
      />
    </Suspense>
  );
}