"use client";

import { Suspense, useEffect, useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Clock,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

function PaymentStatusContent() {
  const [params, setParams] = useState<{ 
    payment?: string; 
    jobId?: string; 
    tranId?: string; 
  }>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      payment: urlParams.get('payment') || undefined,
      jobId: urlParams.get('jobId') || undefined,
      tranId: urlParams.get('tranId') || undefined,
    });
  }, []);

  const paymentStatus = params.payment;
  const jobId = params.jobId;
  const tranId = params.tranId;

  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          title: "Payment Successful!",
          message: "Your job posting has been published successfully and is now live.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconBg: "bg-green-100",
          buttonColor: "bg-green-600 hover:bg-green-700",
        };
      case "failed":
        return {
          icon: XCircle,
          title: "Payment Failed",
          message: "Your payment was not completed. Please try again with a different payment method.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "cancelled":
        return {
          icon: Info,
          title: "Payment Cancelled",
          message: "You have cancelled the payment process. Your job posting has not been published.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconBg: "bg-yellow-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "invalid":
        return {
          icon: AlertCircle,
          title: "Invalid Payment",
          message: "The payment session was invalid or has expired. Please start over.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconBg: "bg-orange-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "error":
        return {
          icon: XCircle,
          title: "Payment Error",
          message: "An unexpected error occurred during payment processing. Please contact support.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "pending":
        return {
          icon: Clock,
          title: "Pending Approval",
          message: "Your job has been submitted and is awaiting admin approval.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconBg: "bg-blue-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          icon: Info,
          title: "Payment Status",
          message: "No payment status information available.",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconBg: "bg-gray-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const statusConfig = getStatusConfig(paymentStatus);

  if (!params.payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/jobs" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Jobs
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">Payment Status</h1>
            </div>
            <Link 
              href="/jobs/post" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Post New Job
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-xl shadow-sm border ${statusConfig.bgColor} ${statusConfig.borderColor} p-8`}>
          <div className="text-center">
            {/* Icon */}
            <div className={`w-20 h-20 ${statusConfig.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <statusConfig.icon className={`h-10 w-10 ${statusConfig.color}`} />
            </div>

            {/* Title & Message */}
            <h1 className={`text-2xl font-bold ${statusConfig.color} mb-3`}>
              {statusConfig.title}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {statusConfig.message}
            </p>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
              {jobId && paymentStatus === "success" && (
                <div className="bg-white rounded-lg border p-4 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Job ID</div>
                  <div className="font-mono text-lg font-semibold text-gray-900">{jobId}</div>
                </div>
              )}
              
              {tranId && (paymentStatus === "failed" || paymentStatus === "cancelled" || paymentStatus === "error") && (
                <div className="bg-white rounded-lg border p-4 text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Transaction ID</div>
                  <div className="font-mono text-sm font-semibold text-gray-900 truncate">{tranId}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {paymentStatus === "success" ? (
                <>
                  <Link
                    href={`/jobs/${jobId}`}
                    className={`flex items-center justify-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors ${statusConfig.buttonColor}`}
                  >
                    <ExternalLink size={16} />
                    View Job Posting
                  </Link>
                  <Link
                    href="/jobs/post"
                    className="flex items-center justify-center gap-2 border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
                  >
                    Post Another Job
                  </Link>
                </>
              ) : (
                <Link
                  href="/jobs/post"
                  className={`flex items-center justify-center gap-2 text-white px-6 py-3 rounded-lg font-medium transition-colors ${statusConfig.buttonColor}`}
                >
                  {paymentStatus === "cancelled" ? "Try Again" : "Retry Payment"}
                </Link>
              )}
              
              <Link
                href="/jobs"
                className="flex items-center justify-center gap-2 border border-gray-600 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>

            {/* Help Section for Errors */}
            {(paymentStatus === "failed" || paymentStatus === "error") && (
              <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Need help with your payment?</h3>
                <ul className="text-xs text-gray-600 space-y-1 text-left">
                  <li>• Ensure your card has sufficient funds</li>
                  <li>• Check if your card supports online transactions</li>
                  <li>• Try using a different payment method</li>
                  <li>• Contact your bank for authorization issues</li>
                </ul>
                <div className="mt-3 flex gap-2 justify-center">
                  <Link
                    href="/contact"
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Instant Publishing</h3>
            </div>
            <p className="text-sm text-gray-600">Successful payments automatically publish your job to our platform.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">30-Day Visibility</h3>
            </div>
            <p className="text-sm text-gray-600">Your job posting remains active for 30 days with full candidate access.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Application Management</h3>
            </div>
            <p className="text-sm text-gray-600">Track and manage all applications through your company dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}