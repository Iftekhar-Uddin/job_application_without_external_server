import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  ExternalLink,
  Clock
} from "lucide-react";

// Client component that uses searchParams
function PaymentStatusContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const paymentStatus = searchParams.payment as string;
  const jobId = searchParams.jobId as string;
  const tranId = searchParams.tranId as string;

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
      {/* Payment Status Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${notification.bgColor} ${notification.borderColor} border rounded-lg shadow-lg p-4 max-w-md w-full mx-4`}
          >
            <div className="flex items-start gap-3">
              <notification.icon className={`h-6 w-6 mt-0.5 ${notification.color}`} />
              <div className="flex-1">
                <h3 className={`font-semibold ${notification.color}`}>
                  {notification.title}
                </h3>
                <p className="text-gray-700 text-sm mt-1">
                  {notification.message}
                </p>
                
                {/* Additional info for specific statuses */}
                {jobId && paymentStatus === "success" && (
                  <div className="mt-2 text-xs text-gray-600">
                    Job ID: <span className="font-mono">{jobId}</span>
                  </div>
                )}
                
                {tranId && (paymentStatus === "failed" || paymentStatus === "cancelled") && (
                  <div className="mt-2 text-xs text-gray-600">
                    Transaction ID: <span className="font-mono">{tranId}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex gap-2">
                  {paymentStatus === "success" && (
                    <button
                      onClick={() => {
                        window.location.href = `/jobs?status=published`;
                      }}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      View Posted Jobs
                    </button>
                  )}
                  
                  {(paymentStatus === "failed" || paymentStatus === "error") && (
                    <button
                      onClick={() => {
                        window.location.href = "/jobs/post";
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.location.href = "/jobs"}
                    className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => window.location.href = "/jobs"}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {notification && (
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
          )}
          
          {!notification && (
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

// Main server component
export default function PaymentStatusPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentStatusContent searchParams={searchParams} />
    </Suspense>
  );
}