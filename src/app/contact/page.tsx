"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "payment",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "", category: "payment" });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-6 bg-white/70 rounded-md sm:rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Contact Support</h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Get help with payment issues, job postings, or any other questions you might have.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information - Left Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Contact Methods */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Email Us</h3>
                  <p className="text-gray-600 mt-1 text-sm">iftekharuddin720@gmail.com</p>
                  <p className="text-xs text-gray-500 mt-1">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Call Us</h3>
                  <p className="text-gray-600 mt-1 text-sm">+880 1731-615141</p>
                  <p className="text-xs text-gray-500 mt-1">Sun-Thu from 9am to 6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg shrink-0">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Live Chat</h3>
                  <p className="text-gray-600 mt-1 text-sm">Available 24/7</p>
                  <p className="text-xs text-gray-500 mt-1">Get instant help from our team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Help Section */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2 text-sm md:text-base">Payment Issues?</h3>
            <p className="text-yellow-700 text-xs md:text-sm mb-2">
              For faster resolution, please include your:
            </p>
            <ul className="text-yellow-700 text-xs md:text-sm list-disc list-inside space-y-1">
              <li>Transaction ID</li>
              <li>Job ID (if applicable)</li>
              <li>Payment method used</li>
              <li>Error message received</li>
            </ul>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tips & Insights</h4>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li>• Provide detailed description for faster resolution</li>
              <li>• Include relevant screenshots if possible</li>
              <li>• Check your spam folder for our responses</li>
              <li>• Keep your contact information updated</li>
            </ul>
          </div>
        </motion.div>

        {/* Contact Form - Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition-colors text-sm md:text-base"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition-colors text-sm md:text-base"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Category & Subject Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition-colors text-sm md:text-base"
                  >
                    <option value="payment">Payment Issue</option>
                    <option value="technical">Technical Problem</option>
                    <option value="job-posting">Job Posting</option>
                    <option value="account">Account Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition-colors text-sm md:text-base"
                    placeholder="Brief description of your issue"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-500 transition-colors resize-vertical text-sm md:text-base"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Response Time</h4>
              <p className="text-xs text-gray-500">
                We typically respond within 2-4 hours during business days. For urgent matters, please call us directly.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Working Hours</h4>
              <p className="text-xs text-gray-500">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday - Sunday: Emergency Support Only
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-6 md:mt-8 text-center"
      >
        <p className="text-xs text-gray-500">
          Powered by <span className="font-semibold">Job Portal Support</span> • We're here to help you succeed
        </p>
      </motion.div>
    </div>
  );
}