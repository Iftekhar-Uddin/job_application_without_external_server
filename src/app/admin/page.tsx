"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EmailNotify } from "@/utility/notify";

type PaymentPreview = {
  id: string;
  provider?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type Job = {
  id: string;
  title: string;
  company?: string | null;
  status: string;
  postedAt: string;
  updatedAt?: string | null;
  payments?: PaymentPreview[];
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function fetchJobs() {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) query.set("search", search);
      if (status) query.set("status", status);

      const res = await fetch(`/api/admin/alljobs?${query.toString()}`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.jobs)) throw new Error("Invalid response");

      setJobs(data.jobs);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [page, status]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/alljobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchJobs();
        EmailNotify(id, newStatus);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="py-3 px-2 md:px-6 max-w-7xl mx-auto bg-white/70 rounded-md sm:rounded-lg max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-8rem)]">

      <h2 className="text-xl md:text-3xl font-semibold text-center md:text-start">
        Admin Dashboard
      </h2>
      <p className="text-sm text-gray-500 mb-2">
        Manage all job posts, payments, and publication statuses efficiently.
      </p>


      <div className="flex flex-wrap gap-1.5 mb-2 md:mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="border border-slate-500 rounded-sm md:rounded-md px-2 py-0.5 md:py-1 w-52 md:w-64 focus:ring-1 focus:ring-slate-400 outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-500 rounded-sm md:rounded-md px-2 py-0.5 md:py-1 focus:ring-1 focus:ring-slate-400 outline-none"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button
          onClick={() => {
            setPage(1);
            fetchJobs();
          }}
          className="bg-slate-700 text-white px-5 py-0.5 md:py-1 rounded-sm md:rounded-md hover:bg-black transition-all cursor-pointer"
        >
          Apply
        </button>
        <a
          href="/api/admin/payments?format=csv"
          className="ml-auto text-sm text-blue-600 underline hover:text-blue-800"
        >
          Export Payments (CSV)
        </a>
      </div>

      <div
        className="
          overflow-x-auto overflow-y-auto bg-white/80 rounded-md shadow-md
          h-[calc(100vh-17rem)] md:h-[calc(100vh-20rem)]
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          md:[scrollbar-width:auto] md:[&::-webkit-scrollbar]:block
        "
      >
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-linear-to-r from-blue-500 via-green-500 to-orange-500 text-white uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Job</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap">Payment</th>
              <th className="px-4 py-3 whitespace-nowrap">Created</th>
              <th className="px-4 py-3 whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center items-center py-16"
                  >
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-transparent"></div>
                  </motion.div>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job, i) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-200 transition-colors"
                >

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{job.title}</div>
                    <div className="text-slate-500 text-xs truncate max-w-[140px] md:max-w-none">
                      {job.company ?? "—"}
                    </div>
                  </td>

                  <td
                    className={`px-4 py-3 font-semibold ${job.status === "PENDING"
                      ? "text-yellow-600"
                      : job.status === "PUBLISHED"
                        ? "text-green-600"
                        : "text-red-600"
                      }`}
                  >
                    {job.status}
                  </td>

                  <td className="px-4 py-3">
                    {job.payments?.[0]?.provider ?? "—"} /{" "}
                    {job.payments?.[0]?.status ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(job.postedAt)}
                  </td>

                  <td className="px-4 py-3 flex flex-wrap gap-2 justify-center">
                    {job.status !== "PUBLISHED" && (
                      <button
                        onClick={() => updateStatus(job.id, "PUBLISHED")}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                      >
                        Publish
                      </button>
                    )}
                    {job.status !== "REJECTED" && (
                      <button
                        onClick={() => updateStatus(job.id, "REJECTED")}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    )}
                    <a
                      href={`/jobs/${job.id}`}
                      className="px-3 py-1 border rounded text-xs hover:bg-gray-100 transition"
                    >
                      View
                    </a>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs md:text-md">
        <div>
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-0.5 md:px-3 md:py-1 border rounded hover:bg-white"
          >
            Prev
          </button>
          <div className="px-2 py-0.5 md:px-3 md:py-1 border rounded bg-black text-white">
            {page}
          </div>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-0.5 md:px-3 md:py-1 border rounded hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
