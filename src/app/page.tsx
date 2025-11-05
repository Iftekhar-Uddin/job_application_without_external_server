import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, BrainCog, Handshake, CalendarClock, DollarSign } from "lucide-react";

export default async function Home() {

  const recentJobs = await prisma.job.findMany({
    take: 3,
    orderBy: { postedAt: "desc" },
    include: {
      postedBy: { select: { name: true } },
    },
  });

  const today = new Date();
  const Jobs = recentJobs.filter((job) => new Date(job.deadline as Date) > today && job.status === "PUBLISHED");


  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6 z-0">
      <section
        className="relative bg-cover bg-center rounded-lg shadow-md overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522202195465-dc3bd9c65b6f?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/40"></div>
        <div className="relative text-center py-4 md:py-20 px-4">
          <h1
            className="text-3xl md:text-5xl font-bold mb-4 leading-tight bg-linear-to-r from-blue-400 via-green-400 to-orange-400 bg-size-[300%_300%] animate-gradient-slow bg-clip-text text-transparent">
            Find Your Next Opportunity
          </h1>

          <p className="text-lg md:text-xl md:mb-8 max-w-2xl mx-auto bg-linear-to-r from-blue-400 via-green-400 to-orange-400 bg-size-[300%_300%] animate-gradient-slow bg-clip-text text-transparent">
            Explore thousands of job openings, connect with leading employers, and
            take the next step in your career.
          </p>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-2 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold rounded-md text-white/70">
            Latest Job Openings
          </h2>

        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group relative block bg-white border border-gray-100 rounded-xl shadow-sm  transition-all duration-500 ease-out transform hover:-translate-y-2 hover:shadow-xl hover:rotate-[0.5deg] hover:scale-[1.02] overflow-hidden before:absolute before:inset-0 before:bg-linear-to-r before:from-slate-100 before:to-amber-50 before:-translate-x-full hover:before:translate-x-0 before:transition-transform before:duration-500 before:ease-out bg-linear-to-r from-blue-50 via-green-50 to-orange-50"
            >
              <div className="relative z-10 flex flex-col h-full p-5">
                
                <div className="flex items-center gap-1.5 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">({job.company})</p>
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-4">

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} className="text-red-500" />
                      <span>{job.location}</span>
                    </span>

                    <p className="flex items-center gap-1">
                      <Handshake size={16} className="text-blue-500" />
                      <span>
                        <span className="font-medium">{job.type}</span>
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <div className="space-y-1">
                      {job.salary && (
                        <p className="flex items-center gap-1">
                          <DollarSign size={16} className="text-green-600" />
                          <span>
                            Salary: <span className="font-medium">{job.salary}</span>
                          </span>
                        </p>
                      )}
                      {job.experience && (
                        <p className="flex items-center gap-1">
                          <BrainCog size={16} className="text-blue-500" />
                          <span>
                            Experience:{" "}
                            <span className="font-medium">{job.experience}</span>
                          </span>
                        </p>
                      )}
                      {job.deadline && (
                        <p className="flex items-center gap-1">
                          <CalendarClock size={16} className="text-red-500" />
                          <span>
                            Deadline:{" "}
                            <span className="font-medium text-red-600">
                              {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          </span>
                        </p>
                      )}
                    </div>

                    <div>
                      {job.logo ? (
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-24 h-16 rounded-md object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-16 bg-orange-100 border border-orange-200 rounded-md flex items-center justify-center text-orange-600 font-semibold text-3xl">
                          {job.company.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* {job.skills && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {job.skills
                      .split(",")
                      .slice(0, 4)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-md"
                        >
                          #{skill.trim()}
                        </span>
                      ))}
                  </div>
                )} */}

                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <p className="text-xs text-blue-400">
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </p>
                  <span className="text-orange-600 text-sm font-medium hover:underline hidden md:inline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center md:text-right mt-10">
          <Link
            href="/jobs"
            className="inline-block bg-linear-to-r from-blue-300 via-green-300 to-orange-300 px-8 py-3 rounded-md font-semibold shadow-md transition-all duration-300"
          >
            Explore All Jobs →
          </Link>
        </div>

      </section>
    </div>
  );
}
