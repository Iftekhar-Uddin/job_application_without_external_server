"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  ExternalLink,
  Clock
} from "lucide-react";

export default function JobsPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const jobId = searchParams.get("jobId");
  const tranId = searchParams.get("tranId");
  
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (paymentStatus) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

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
        {showNotification && notification && (
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
                        // Navigate to the posted job or jobs list
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
                        // Retry payment or go back to job submission
                        window.location.href = "/jobs/post/submit";
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Jobs Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-gray-600 mt-2">
            Find your next career opportunity or post a new job opening.
          </p>
        </div>

        {/* Job Posting CTA */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Want to post a job?
              </h2>
              <p className="text-gray-600 mt-1">
                Reach qualified candidates with our job posting platform.
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/jobs/submit"}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Post a Job
            </button>
          </div>
        </div>

        {/* Jobs List Content */}
        <div className="grid gap-6">
          {/* Example job cards - you'll replace this with real data */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900">Senior Frontend Developer</h3>
            <p className="text-gray-600 mt-1">Tech Company • Dhaka, Bangladesh</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">TypeScript</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Next.js</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-green-600 font-semibold">৳80,000 - ৳120,000</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Details →
              </button>
            </div>
          </div>

          {/* Add more job cards here */}
        </div>

        {/* Help Section for Payment Issues */}
        {(paymentStatus === "failed" || paymentStatus === "error" || paymentStatus === "invalid") && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Need help with your payment?
            </h3>
            <p className="text-yellow-700 mb-4">
              If you're experiencing issues with the payment process, here are some solutions:
            </p>
            <ul className="text-yellow-700 list-disc list-inside space-y-1 text-sm">
              <li>Ensure your card has sufficient funds</li>
              <li>Check if your card supports international transactions</li>
              <li>Try using a different payment method</li>
              <li>Contact your bank for authorization issues</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.location.href = "/contact"}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors text-sm"
              >
                Contact Support
              </button>
              <button
                onClick={() => window.location.href = "/jobs/posts/submit"}
                className="border border-yellow-600 text-yellow-600 px-4 py-2 rounded hover:bg-yellow-100 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}