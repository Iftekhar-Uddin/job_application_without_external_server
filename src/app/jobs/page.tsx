import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  MapPin,
  CalendarClock,
  BrainCog,
  DollarSign,
  Handshake,
  Search,
} from "lucide-react";
import React from "react";


const TotalJobs = async ({ searchParams }: any)  => {

  const resolvedParams = await Promise.resolve(searchParams ?? {});

  const session = await auth();

  console.log(session)

  const querys = (resolvedParams?.query as string) || "";
  const searchType = (resolvedParams?.type as string) || "";
  const searchLocation = (resolvedParams?.location as string) || "";

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6); // include today -> last 7 days

  const baseActiveWhere = {
    status: "PUBLISHED",
    deadline: { gt: today },
  } as any;


  const jobs = await prisma.job.findMany({
    where: {
      AND: [
        baseActiveWhere,
        querys
          ? {
            OR: [
              { title: { contains: querys, mode: "insensitive" } },
              { company: { contains: querys, mode: "insensitive" } },
              { responsibilities: { contains: querys, mode: "insensitive" } },
            ],
          }
          : {},
        searchType ? { type: searchType } : {},
        searchLocation
          ? { location: { contains: searchLocation, mode: "insensitive" } }
          : {},
      ],
    },
    orderBy: { postedAt: "desc" },
    include: { postedBy: true },
    take: 40,
  });


  const totalAvailableCountPromise = prisma.job.count({
    where: baseActiveWhere,
  });

  const categoriesPromise = prisma.job.groupBy({
    by: ["type"],
    where: baseActiveWhere,
    _count: { _all: true },
  });

  const recentPublished = await prisma.job.findMany({
    where: {
      AND: [
        baseActiveWhere,
        { postedAt: { gte: sevenDaysAgo } },
      ],
    },
    select: { postedAt: true },
    orderBy: { postedAt: "asc" },
  });

  const totalAvailableCount = await totalAvailableCountPromise;
  const categoryGroups = await categoriesPromise;

  // Compute last 7 day counts (labels + counts)
  function buildLast7DaysCounts(items: { postedAt: Date }[]) {
    const days: { label: string; iso: string; count: number }[] = [];
    const copy = new Date(sevenDaysAgo);
    for (let i = 0; i < 7; i++) {
      const iso = copy.toISOString().slice(0, 10);
      days.push({
        label: copy.toLocaleDateString(undefined, { weekday: "short" }),
        iso,
        count: 0,
      });
      copy.setDate(copy.getDate() + 1);
    }
    for (const it of items) {
      const iso = new Date(it.postedAt).toISOString().slice(0, 10);
      const d = days.find((x) => x.iso === iso);
      if (d) d.count++;
    }
    return days;
  }
  const last7 = buildLast7DaysCounts(recentPublished);

  // Build category map
  const categories = categoryGroups.map((g) => ({
    type: g.type || "Other",
    count: g._count?._all ?? 0,
  }));


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 bg-white/70 rounded-md sm:rounded-lg overflow-hidden" style={{ minHeight: "calc(100vh - 4rem)" }}>

      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">

          <main className="lg:col-span-8 z-0">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-linear-to-r from-blue-400 via-green-400 to-orange-400 bg-clip-text text-transparent">
                <h1 className="text-xl md:text-2xl font-bold">Available Jobs</h1>
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-700">{jobs.length}</span>{" "}
                  results • <span className="text-slate-600">{totalAvailableCount}</span>{" "}
                  total active openings
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2">
                {querys && (
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 border text-slate-700">
                    Search: <span className="font-medium">"{querys}"</span>
                  </span>
                )}
                {searchType && (
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 border text-slate-700">
                    Type: <span className="font-medium">{searchType}</span>
                  </span>
                )}
                {searchLocation && (
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 border text-slate-700">
                    Location: <span className="font-medium">{searchLocation}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-md border border-slate-300 rounded-xl p-8 text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                    No jobs found
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting filters or removing search terms.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="group relative block bg-white/80 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="relative z-10 flex flex-col p-3.5 md:p-4">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] md:text-[16px] font-semibold text-slate-800 group-hover:text-orange-600 transition">
                              {job.title}
                            </h3>
                            <p className="text-[13px] text-gray-600 truncate">{job.company}</p>
                          </div>

                          <div className="shrink-0 ml-1.5">
                            {job.logo ? (
                              <img
                                src={job.logo}
                                alt={job.company}
                                className="w-20 h-12 rounded-md object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-20 h-12 bg-orange-100 border border-orange-200 rounded-md flex items-center justify-center text-orange-600 font-semibold text-base">
                                {job.company?.charAt(0) ?? "J"}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 text-gray-600 text-[13px] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 flex-wrap">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin size={14} className="text-red-500 flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 truncate">
                              <Handshake size={14} className="text-blue-500 flex-shrink-0" />
                              <span className="truncate">{job.type}</span>
                            </span>
                            {job.salary && (
                              <span className="inline-flex items-center gap-1 truncate">
                                <DollarSign size={14} className="text-green-600 flex-shrink-0" />
                                <span className="font-medium truncate">{job.salary}</span>
                              </span>
                            )}
                            {job.experience && (
                              <span className="inline-flex items-center gap-1 truncate">
                                <BrainCog size={14} className="text-blue-500 flex-shrink-0" />
                                <span className="font-medium truncate">{job.experience}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* {job.skills && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {job.skills
                              .split(",")
                              .slice(0, 5)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                                >
                                  #{skill.trim()}
                                </span>
                              ))}
                          </div>
                        )} */}

                        {/* Footer */}
                        <div className="mt-3 border-t pt-2.5 flex items-center justify-between text-[12px] text-gray-500">
                          <p className="text-amber-600">Deadline {new Date(job?.deadline as Date).toLocaleDateString()}</p>
                          <h1 className="hidden md:inline text-blue-400 font-medium">
                            View →
                          </h1>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              {/* Search card */}
              <div className="bg-white/70 backdrop-blur-md border border-slate-400 rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Search & Filters</h4>
                <form method="GET" className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      name="query"
                      defaultValue={querys}
                      placeholder="Job title or company..."
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="type"
                      defaultValue={searchType}
                      className="w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 outline-none"
                    >
                      <option value="">All types</option>
                      <option value="Internship">Internship</option>
                      <option value="Part time">Part time</option>
                      <option value="Full time">Full time</option>
                      <option value="Contractual">Contractual</option>
                    </select>

                    <input
                      type="text"
                      name="location"
                      defaultValue={searchLocation}
                      placeholder="Location"
                      className="w-full py-2 px-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 text-sm bg-black text-white rounded-lg font-medium"
                    >
                      Search
                    </button>
                    <a
                      href="/jobs"
                      className="inline-flex items-center justify-center px-3 py-2 border bg-amber-400 border-gray-300 rounded-lg text-sm text-black"
                    >
                      Reset
                    </a>
                  </div>
                </form>
              </div>

              <div className="bg-white/70 backdrop-blur-md border border-slate-400 rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-500">Total Active</div>
                  <div className="text-lg font-semibold">{totalAvailableCount}</div>
                </div>

                <div className="text-xs text-gray-500 mb-2">By Job Type</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {categories.length === 0 ? (
                    <div className="text-sm text-gray-400 col-span-2">No data</div>
                  ) : (
                    categories.map((c) => (
                      <div
                        key={c.type}
                        className="flex items-center justify-between bg-gray-50 rounded-md p-2"
                      >
                        <div className="text-sm text-slate-700">{c.type}</div>
                        <div className="text-sm font-medium text-slate-800">{c.count}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-2">Published last 7 days</div>
                <div className="w-full h-12 flex items-end gap-2">
                  {last7.map((d) => {
                    const max = Math.max(...last7.map((x) => x.count, 0), 1);
                    const height = Math.round((d.count / max) * 100);
                    return (
                      <div key={d.iso} className="flex-1 text-center">
                        <div
                          className="mx-auto w-3 rounded-t"
                          style={{
                            height: `${Math.max(6, height)}%`,
                            background:
                              "linear-gradient(180deg, rgba(59,130,246,0.9), rgba(240,173,78,0.9))",
                            transition: "height 300ms",
                          }}
                          title={`${d.label}: ${d.count}`}
                        />
                        <div className="text-[10px] text-gray-400 mt-1">{d.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>


              <div className="bg-white/70 backdrop-blur-md border border-slate-400 rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/jobs/post"
                    className="block text-center text-sm py-2 rounded-lg border border-emerald-500 text-white bg-emerald-500"
                  >
                    Post a Job
                  </Link>
                  <Link
                    href="/jobs"
                    className="block text-center text-sm py-2 rounded-lg border border-gray-400 text-slate-700"
                  >
                    Browse All Jobs
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TotalJobs;