"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { fetcher } from "@/utility/fetcher";
import useSWR from "swr";

const ApplyButton = ({ jobId }: { jobId: string }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [applicationStatus, setApplicationStatus] = useState<"idle" | "success" | "error">("idle");

  const { data, error, isLoading } = useSWR(
    jobId ? `/api/job/${jobId}/find` : null,
    fetcher
  );

  const handleApply = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setErrorMessage("");
    setApplicationStatus("idle");

    try {
      const response = await fetch(`/api/job/${jobId}/apply`, {
        method: "POST",
      });

      if (response.ok) {
        setApplicationStatus("success");
      }

      setApplicationStatus("success");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to apply for the job");
      }

    } catch (error) {

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong");
      }
      setApplicationStatus("error");

      setTimeout(() => {
        setErrorMessage("");
        setApplicationStatus("idle");
      }, 2500);

    }
  };

  if (status === "loading") {
    return <button disabled>Loading...</button>;
  }

  if (applicationStatus === "success") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-green-600">Applied Successfully</p>
        <Link className="px-3 py-1 text-amber-500 ring-1 rounded-full hover:bg-blue-100 hover:text-blue-500" href={"/dashboard"}>
          {"View your applicaton"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex content-center justify-center text-center items-center gap-x-4">
      {applicationStatus === "error" && <p className="text-red-500 md:font-semibold justify-center text-center">{errorMessage}</p>}
      <button disabled={data} className={`py-1 px-4 rounded-full font-semibold ${data ? "text-green-500 bg-black" : " cursor-pointer bg-slate-700 text-white hover:bg-black"} `} onClick={handleApply}>{data? "Already applied" : "Apply"} </button>
    </div>
  );

};

export default ApplyButton;
