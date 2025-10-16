"use client";

import { applicants } from "@/actions/applicants";
import { useTransition } from 'react';
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { currentUserClient } from "@/hooks/currentUser";
// import { initSocket } from "@/lib/socket";


type DropdownProps = {
    jobId: any;
    applicationId: any;
    applicant: any;
    job: any
};

type ApplicationStatus = "Rejected" | "Accepted" | "Reviewing";

export default function StatusButton({ applicationId, jobId, applicant, job }: DropdownProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const currentUser = currentUserClient()


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const handleSubmit = async (applicationId: any, jobId: any, status: ApplicationStatus) => {

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            
            const res = await applicants(applicationId, jobId, status);

            if (res.success) {
                setSuccess(res.success);

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


                startTransition(() => {
                    router.refresh();
                });


            } else if (res.error) {
                setError(res.error);
            }

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred.');

        } finally {
            setIsSubmitting(false);
            setIsOpen(false)
        }

    };


    return (
        <div className="relative inline-block md:flex lg:inline-block text-left mt-1 max-h-fit" ref={menuRef}>
            {/* Toggle Button */}
            {isOpen && (
                <div className="flex md:w-auto md:flex-wrap lg:inline-grid grid-cols-3 lg:w-auto border gap-0.5 border-amber-100 rounded-md shadow-lg z-10 bg-amber-100">
                    <button disabled={isSubmitting} onClick={() => handleSubmit(applicationId, jobId, "Rejected")} className="block w-full px-2.5 md:px-2 py-0 md:py-0.5 bg-slate-600 text-red-500 md:rounded-2xl hover:bg-black focus:outline-none cursor-pointer md:text-sm">
                        Rejected
                    </button>
                    <button disabled={isSubmitting} onClick={() => handleSubmit(applicationId, jobId, "Accepted")} className="block w-full px-2.5 md:px-2 py-0 md:py-0.5 bg-slate-600 text-green-400 md:rounded-2xl hover:bg-black focus:outline-none cursor-pointer md:text-sm">
                        Accepted
                    </button>
                    <button disabled={isSubmitting} onClick={() => handleSubmit(applicationId, jobId, "Reviewing")} className="block w-full px-2.5 md:px-2 py-0 md:py-0.5 bg-slate-600 text-yellow-400 md:rounded-2xl hover:bg-black focus:outline-none cursor-pointer md:text-sm">
                        Reviewing
                    </button>
                </div>
            )}

            {/* Dropdown */}
            <div className="flex justify-end md:justify-start mt-0.5 md:mt-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-2.5 md:px-3.5 py-0  bg-slate-600 text-white rounded-sm md:rounded-2xl hover:bg-black focus:outline-none cursor-pointer"
                >
                    {isOpen ? "Cancel" : "Update"}
                </button>
            </div>
        </div>
    );
};

