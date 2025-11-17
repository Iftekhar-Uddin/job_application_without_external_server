"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";

type ApplicantModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export default function ApplicantModal({ open, onClose, title, children, size = "lg" }: ApplicantModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { data: session, update } = useSession();


  if (!session) {
    router.push("/auth/signin")
  };

  // disabled background scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const sizeClass = size === "sm" ? "max-w-2xl" : size === "md" ? "max-w-4xl" : "max-w-5xl";

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label={typeof title === "string" ? title : "Applicants dialog"}
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-6"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        className={`relative ${sizeClass} w-full mx-auto mt-12 md:mt-0 bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-slate-600">Manage applicants and their statuses</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <X className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 md:p-5 max-h-[75vh] overflow-y-auto space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
