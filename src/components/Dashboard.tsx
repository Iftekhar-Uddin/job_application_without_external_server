"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  BrainCog,
  CalendarClock,
  DollarSign,
  Search,
  List,
  Grid,
} from "lucide-react";

import StatusButton from "@/components/StatusButton";
import ApplicantModal from "./ApplicantModal";


type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  experience?: string;
  postedAt?: string | Date;
  deadline?: string | Date;
  logo?: string | null;
  skills?: string[];
  _count?: { applications?: number };
  vacancies?: number;
};

type ApplicantUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  education?: string;
  experience?: string;
  previousInstitute?: string;
  skills?: string[];
};

type Application = {
  id: string;
  status?: string;
  appliedAt?: string | Date;
  user?: ApplicantUser;
  job: Job;
};

type DashboardProps = {
  postedJobs?: Job[];
  applications?: Application[];
  className?: string;
  isLoading?: boolean;
};

export default function DashboardIntegrated({
  postedJobs = [],
  applications = [],
  className = "",
  isLoading = false,
}: DashboardProps) {
  const [view, setView] = useState<"posts" | "apps">("posts");
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Reviewing" | "Accepted" | "Rejected">("All");


  const [openJob, setOpenJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[] | null>(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantsError, setApplicantsError] = useState<string | null>(null);


  const stats = useMemo(() => ({
    postedCount: postedJobs.length,
    applicationsCount: applications.length,
    openPositions: postedJobs.filter((j) => !j.deadline || new Date(j.deadline) > new Date()).length,
    recentApplicants: applications.filter((a) => {
      if (!a.appliedAt) return false;
      const days = (Date.now() - new Date(a.appliedAt).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 7;
    }).length,
  }), [postedJobs, applications]);


  const filteredJobs = useMemo(() => {
    if (!query) return postedJobs;
    const q = query.toLowerCase();
    return postedJobs.filter((j) =>
      [j.title, j.company, j.location, j.skills, j.type, j.salary]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q))
    );
  }, [postedJobs, query]);

  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return [a.job.title, a.job.company, a.job.location, a.status]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q));
    });
  }, [applications, query, statusFilter]);

  // Fetch applicants via API route (lazy)
  const fetchApplicantsForJob = async (jobId: string) => {
    setLoadingApplicants(true);
    setApplicants(null);
    setApplicantsError(null);
    try {
      const res = await fetch(`/api/applicants?jobId=${encodeURIComponent(jobId)}`);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      // data should be Application[]
      setApplicants(data);
    } catch (err: any) {
      console.error(err);
      setApplicantsError(err?.message ?? "Failed to load applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const openApplicantsModal = async (job: Job) => {
    setOpenJob(job);
    await fetchApplicantsForJob(job.id);
  };

  const closeApplicantsModal = () => {
    setOpenJob(null);
    setApplicants(null);
    setApplicantsError(null);
    setLoadingApplicants(false);
  };

  // called when a status update succeeds so I refresh applicants
  const handleApplicantStatusChanged = () => {
    if (openJob) fetchApplicantsForJob(openJob.id);
  };


  const StatCard = ({ title, value, hint }: { title: string; value: React.ReactNode; hint?: string }) => (
    <div className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
      <div className="text-xs font-semibold text-slate-600">{title}</div>
      <div className="mt-2 text-xl font-bold text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );


  const JobCard = ({ job }: { job: Job }) => (
    <div className="group block h-full">
      <article className="relative flex flex-col md:flex-row gap-4 p-5 bg-white rounded-xl shadow hover:shadow-lg transition ring-1 ring-gray-100 h-full">


        <div className="flex items-start gap-4 w-full md:w-auto">
          <div className="flex-1 min-w-0">
            <div className="flex w-full justify-between">

              <div className="flex-1 min-w-0 pr-24">
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">{job.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{job.company} • {job.location} • <span className="font-medium">{job.type}</span></p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  {job.salary && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border rounded-md"><DollarSign size={14} /> {job.salary}</span>}
                  {job.experience && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border rounded-md"><BrainCog size={14} /> {job.experience}</span>}
                  {job.deadline && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border rounded-md text-red-600"><CalendarClock size={14} /> {new Date(job.deadline).toLocaleDateString()}</span>}
                </div>
              </div>

            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {(
                Array.isArray(job?.skills)
                  ? job.skills
                  : (job?.skills || "")
                    .split(",")
                    .map((s) => s.trim())
              )
                .filter(Boolean)
                .slice(0, 4)
                .map((skill, index) => {
                  // const colors = [
                  //   "bg-red-100 text-red-700",
                  //   "bg-blue-100 text-blue-700",
                  //   "bg-green-100 text-green-700",
                  //   "bg-yellow-100 text-yellow-700",
                  //   "bg-slate-200 text-slate-700",
                  // ];
                  // const colorClass = colors[index % colors.length];
                  return (
                    <span
                      key={skill}
                      style={{ animationDelay: `${index * 0.3}s` }}
                      // className={`text-xs px-2 py-1 rounded-full font-medium animate-colorCycle ${colorClass}`}
                      className={`text-xs px-2 py-1 rounded-full font-medium bg-slate-200`}
                    >
                      #{skill}
                    </span>
                  );
                })}
              {(!job?.skills ||
                (Array.isArray(job?.skills) && job.skills.length === 0)) && (
                  <span className="text-xs text-slate-500 italic">No skill required</span>
                )}
            </div>

            <div className="flex gap-2 mt-2">
              <Link href={`/jobs/${job.id}`} className="text-xs text-slate-600 px-3 py-1 bg-slate-100 rounded-sm">View</Link>
              <Link href={`/jobs/edit/${job.id}`} className="text-xs text-orange-500 px-3 py-1 bg-orange-100 rounded-sm">Edit job</Link>
              <button
                onClick={() => openApplicantsModal(job)}
                className="text-xs text-emerald-600 px-3 py-1 bg-emerald-100 rounded-sm cursor-pointer"
              >
                {job._count?.applications ?? 0} Applications
              </button>
            </div>
          </div>
        </div>

        {/* Logo Box - Absolute Top-Right */}
        <div className="absolute top-5 right-5 w-16 h-16 rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
          {job.logo ? (
            <img src={job.logo} alt={`${job.company} logo`} className="w-full h-full object-cover" />
          ) : (
            <span className="text-orange-600 font-bold text-lg">{job.company?.charAt(0) ?? "?"}</span>
          )}
        </div>

      </article>
    </div>

  );

  // APPLICATION ROW for modal: includes collapse toggle for full applicant info; passes onSuccess to StatusButton
  const ApplicationRow = ({ application }: { application: Application }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm border transition">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center text-orange-600 font-bold">
              {application.user?.image ? (
                <Image src={application.user.image} width={48} height={48} alt={application.user.name || "profile"} className="rounded-md object-cover" />
              ) : (
                application.user?.name?.charAt(0) ?? "?"
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">{application.user?.name}</div>
              <div className="text-sm text-gray-500 truncate">{application.user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="text-xs text-gray-500">Applied {application.appliedAt ? formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true }) : "-"}</div>

            <div>
              <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${application.status === "Reviewing" ? "bg-yellow-50 text-yellow-600" :
                application.status === "Accepted" ? "bg-green-100 text-green-600" :
                  application.status === "Rejected" ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-600"
                }`}>{application.status ?? "-"}</span>
            </div>

            <button onClick={() => setOpen(v => !v)} className="text-xs px-2 py-1 text-blue-500 bg-blue-100 hover:bg-blue-200 rounded-sm">{open ? "Hide" : "Details"}</button>

            <button onClick={() => window.open(`/jobs/${application.job.id}`, "_blank")} className="text-xs px-2 py-1 rounded-sm bg-gray-200 hover:bg-gray-300">View Job</button>
          </div>
        </div>

        {open && (
          <div className="mt-3 border-t pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="font-medium">Education:</div>
              <div className="text-slate-600 italic">{application.user?.education ?? "N/A"}</div>
              <div className="mt-2 font-medium">Experience:</div>
              <div className="text-slate-600 italic">{application.user?.experience ?? "N/A"}</div>
            </div>

            <div>
              <div className="font-medium">Skills:</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {(
                  Array.isArray(application?.user?.skills)
                    ? application?.user?.skills
                    : (application?.user?.skills || "")
                      .split(",")
                      .map((s) => s.trim())
                )
                  .filter(Boolean)
                  .slice(0, 20)
                  .map((skill, index) => {
                    const colors = [
                      "bg-red-100 text-red-700",
                      "bg-blue-100 text-blue-700",
                      "bg-green-100 text-green-700",
                      "bg-yellow-100 text-yellow-700",
                      "bg-slate-200 text-slate-700",
                    ];
                    const colorClass = colors[index % colors.length];
                    return (
                      <span
                        key={skill}
                        className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                      >
                        {skill}
                      </span>
                    );
                  }
                  )}

                {(!application?.user?.skills || (Array.isArray(application?.user?.skills) && application.user.skills.length === 0)) &&
                  (<span className="text-sm text-slate-600 italic">N/A</span>)
                }

              </div>
            </div>

            <div>
              <div className="font-medium">Previous Institute:</div>
              <div className="text-slate-600">{application.user?.previousInstitute ?? "N/A"}</div>
              <div className="mt-2 font-medium">Applied At:</div>
              <div className="text-yellow-600">{application.appliedAt ? new Date(application.appliedAt).toLocaleString() : "-"}</div>

              <div className="mt-1">
                <StatusButton
                  applicationId={application.id}
                  jobId={application.job?.id}
                  applicant={application}
                  job={application.job}
                  onSuccess={handleApplicantStatusChanged}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-6 bg-white/70 rounded-md sm:rounded-lg ${className}`}>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Overview of posted jobs and recent applications</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, companies or skills"
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-slate-400 outline-none w-full transition"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setLayout("list")}
                aria-pressed={layout === "list"}
                className={`p-2 rounded-md border ${layout === "list" ? "bg-slate-200" : "bg-white"}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setLayout("grid")}
                aria-pressed={layout === "grid"}
                className={`p-2 rounded-md border ${layout === "grid" ? "bg-slate-200" : "bg-white"}`}
              >
                <Grid size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium ${view === "posts" ? "bg-orange-600 text-white" : "bg-white text-gray-700 ring-1"}`}
                onClick={() => setView("posts")}
              >
                Posted Jobs
              </button>
              <button
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium ${view === "apps" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 ring-1"}`}
                onClick={() => setView("apps")}
              >
                Applications
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Posted Jobs" value={stats.postedCount} hint="Total openings you posted" />
          <StatCard title="Applications" value={stats.applicationsCount} hint="Total candidates applied" />
          <StatCard title="Open Positions" value={stats.openPositions} hint="No deadline or still open" />
          <StatCard title="Recent Applicants" value={stats.recentApplicants} hint="Applied in last 7 days" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:h-[calc(100vh-25rem)] overflow-hidden">
        <div className="lg:col-span-2 space-y-4 md:overflow-y-auto md:pr-2 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100">
          {view === "apps" && (
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-700">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-sm rounded-md border px-2 py-1"
                >
                  <option>All</option>
                  <option>Reviewing</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                </select>
              </div>
              <div className="text-sm text-slate-700">Showing {filteredApplications.length} applications</div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : view === "posts" ? (
            filteredJobs.length === 0 ? (
              <div className="p-6 bg-white rounded-lg text-center text-gray-600">No posted jobs found. <Link href="/jobs/new" className="underline text-orange-600">Post a job</Link></div>
            ) : layout === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {filteredJobs.map((job) => <div key={job.id} className="h-full"><JobCard job={job} /></div>)}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-white rounded-xl shadow-sm border flex items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center text-orange-600 font-bold">
                        {job.logo ? <img src={job.logo} alt={job.company} className="w-full h-full object-cover" /> : job.company?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{job.title}</div>
                        <div className="text-xs text-gray-500 truncate">{job.company} • {job.location} • {job.type}</div>
                        <div className="flex gap-0.5 text-xs mt-1">
                          <Link href={`/jobs/${job.id}`} className=" text-slate-600 px-1 py-0.5  rounded-sm">View</Link>
                          <Link href={`/jobs/edit/${job.id}`} className=" text-orange-500 px-1 py-0.5  rounded-sm">Edit job</Link>
                          <button
                            onClick={() => openApplicantsModal(job)}
                            className="text-emerald-500 px-1 py-0.5  rounded-sm cursor-pointer"
                          >
                            {job?._count?.applications ?? 0} Applications
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredApplications.length === 0 ? (
              <div className="p-6 bg-white rounded-lg text-center text-gray-600">No applications found.</div>
            ) : (
              <div className="space-y-2.5">
                {filteredApplications.map((a) => (
                  <div key={a.id} className="p-4 bg-white rounded-xl shadow-sm border flex items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center text-orange-600 font-bold">
                        {a.job.logo ? <img src={a.job.logo} alt={a.job.company} className="w-full h-full object-cover" /> : a.job.company?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{a.job.title}</div>
                        <div className="text-xs text-slate-500 truncate">{a.job.company} • {a.job.location}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/jobs/${a.job.id}`} className="text-sm text-slate-600 px-2 py-1 bg-slate-200 rounded-sm">View</Link>
                      <span className={`text-sm px-2 py-1 bg-gray-100 rounded-sm ${a.status === "Reviewing" ? "bg-yellow-50 text-yellow-600" :
                        a.status === "Accepted" ? "bg-green-100 text-green-600" :
                          a.status === "Rejected" ? "bg-red-100 text-red-600" :
                            "bg-gray-100 text-gray-600"
                        }`}>{a.status ?? "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h4>
            <Link href="/jobs/post" className="block bg-orange-600 hover:bg-orange-700 text-white text-center py-2 rounded-lg font-medium transition">Post New Job</Link>
            <Link href="/profile" className="block bg-white hover:bg-gray-50 border text-center py-2 rounded-lg mt-2 transition text-gray-800 font-medium">Edit Profile</Link>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tips & Insights</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Post jobs with detailed skills and responsibilities.</li>
              <li>• Track applications regularly to hire faster.</li>
              <li>• Keep your company profile updated for better visibility.</li>
            </ul>
          </div>
        </div>
      </div>

      <ApplicantModal open={!!openJob} onClose={closeApplicantsModal} title={openJob ? `${openJob.title} — Applicants` : "Applicants"}>
        {loadingApplicants ? (
          <div className="py-8 text-center text-gray-500">Loading applicants…</div>
        ) : applicantsError ? (
          <div className="py-6 text-center text-sm text-red-500">{applicantsError}</div>
        ) : !applicants || applicants.length === 0 ? (
          <div className="py-6 text-center text-gray-600">No applicants found for this job.</div>
        ) : (
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id}><ApplicationRow application={a} /></div>
            ))}
          </div>
        )}
      </ApplicantModal>

    </div>
  );
}