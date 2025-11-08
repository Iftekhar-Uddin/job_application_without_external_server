"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, startTransition } from "react";
import { applicants } from "@/actions/applicants";
import { useSession } from 'next-auth/react';

type DropdownProps = {
  jobId: any;
  applicationId: any;
  applicant: any;
  job: any;
  onSuccess?: () => void;
};

type ApplicationStatus = "Rejected" | "Accepted" | "Reviewing";

export default function StatusButton({
  applicationId,
  jobId,
  applicant,
  job,
  onSuccess,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, update } = useSession();

  if (!session) {
    router.push("/auth/signin")
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (status: ApplicationStatus) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await applicants(applicationId, jobId, status);
      if (res?.success) {
        if (onSuccess) onSuccess();
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId: applicant?.userId,
            title: job?.title,
            body: status,
            data: { url: "/dashboard" }
          })
        });

        // startTransition(() => {
        //   router.refresh();
        // });

      } else {
        setError(res?.error ?? "Failed to update status");
      }
    } catch (err) {
      setError("Unexpected error");
    } finally {
      setIsSubmitting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative md:inline-block text-left" ref={menuRef}>
      {isOpen && (
        <div className="mb-1 md:w-66 z-20 bg-white border rounded-sm md:shadow-sm overflow-hidden">
          <div className="flex">
            <button
              disabled={isSubmitting}
              onClick={() => handleSubmit("Rejected")}
              className="px-1.5 py-1 md:px-2 text-sm text-red-600 hover:bg-slate-200 w-full"
            >
              Rejected
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleSubmit("Accepted")}
              className="px-1.5 py-1 md:px-2 text-sm text-green-600 hover:bg-slate-200 w-full"
            >
              Accepted
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleSubmit("Reviewing")}
              className="px-1.5 py-1 md:px-2 text-sm text-yellow-600 hover:bg-slate-200 w-full"
            >
              Reviewing
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-black text-xs md:text-sm"
      >
        {isOpen ? "Cancel" : "Update"}
      </button>

      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}

