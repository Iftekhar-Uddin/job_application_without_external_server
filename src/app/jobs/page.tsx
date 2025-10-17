import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import React from "react";

const TotalJobs = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const session = await auth()
  const { query, type, location } = await searchParams;
  const querys = query as string | undefined;
  const searchType = type as string | undefined;
  const searchLocation = location as string | undefined;

  const jobs = await prisma.job.findMany({
    where: {
      AND: [
        querys
          ? {
            OR: [
              { title: { contains: querys, mode: "insensitive" } },
              { company: { contains: querys, mode: "insensitive" } },
              { responsibilities: { contains: querys, mode: "insensitive" } },
            ]
          }
          : {},
        type ? { type: searchType } : {},
        searchLocation
          ? { location: { contains: searchLocation, mode: "insensitive" } }
          : {}
      ]
    },
    orderBy: { postedAt: "desc" },
    include: { postedBy: true },
  });


  let today = new Date();
  const AvailableJobs = jobs.filter((job) => new Date(job?.deadline as Date) > today);

  return (
    <div className="">
      <div className="max-w-7xl mx-auto p-2 md:p-4 bg-amber-100 rounded-md ring-1 ring-orange-500">
        <h1 className="text-base md:text-2xl font-semibold text-orange-500">Find your Job</h1>
        <div className="w-full mt-1 md:mt-2">
          <form className="grid gap-2 md:gap-4 grid-cols-3">
            <input
              type="text"
              name="query"
              placeholder="Search jobs... (e.g., software)"
              className="border border-gray-500 text-xs md:text-base rounded-xs md:rounded-sm py-1 px-2 focus:outline-none md:focus:ring-1"
            />
            <select
              name="type"
              className="border border-gray-500 text-xs md:text-base rounded-xs md:rounded-sm py-1 px-2 focus:outline-none md:focus:ring-1"
            >
              <option value="">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Part time">Part time</option>
              <option value="Full time">Full time</option>
              <option value="Contractual">Contractual</option>
            </select>
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="border border-gray-500 text-xs md:text-base rounded-xs md:rounded-sm py-1 px-2 focus:outline-none md:focus:ring-1"
            />
            <button
              type="submit"
              className="col-span-3 py-0.5 md:py-1 rounded-md bg-orange-500 md:text-lg cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto bg-amber-100 md:mt-4 mt-2 rounded-lg  p-2 md:p-4 ring-1 ring-orange-500">
        <h1 className="text-lg md:text-3xl text-center text-orange-500 md:mb-4 underline">
          Available Jobs
        </h1>
        <div className={`${AvailableJobs.length === 0 ? "flex items-center" : "grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] justify-items-center p-2"} max-h-[calc(100vh-15rem)] overflow-y-auto`}>
          {AvailableJobs.length === 0 &&
            <div className="w-full flex justify-center">
              <h1 className="text-lg md:text-4xl text-orange-500 bg-gray-200 p-4 rounded-lg">No Job Available! Please try again.</h1>
            </div>
          }
          {AvailableJobs.map((job) => (
            <div key={job.id}
              className="w-full min-h-[150px] ring-1 ring-orange-500 rounded-md md:rounded-lg p-3 md:p-4 hover:shadow-lg hover:scale-[0.97] transition-all duration-200 ease-in max-w-[380px]bg-amber-50"
            >
              <div className="flex px-1.5 pt-1.5 text-orange-500 md:px-0 w-full justify-between">
                <h1 className="font-bold md:text-xl">{job.title}</h1>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-black underline text-sm md:text-md cursor-pointer hover:text-black"
                >
                  View Details
                </Link>
              </div>

              <h1 className="px-1.5 md:px-0 text-sm">{job.company}</h1>

              <div className="flex px-1.5 pt-1.5 md:px-0 w-full justify-between md:mt-4">

                <div className="text-sm md:text-base">
                  <h2 className="text-red-500">Salary: {job.salary}</h2>
                  <p className="line-clamp-2 text-blue-500">
                    {`Type: ${job.type}`}
                  </p>
                </div>
                <div className="text-right text-sm md:text-base">
                  <p className="text-green-500">Exp: {job.experience}</p>
                  <p className="line-clamp-2 text-yellow-700">
                    {job.deadline && `Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalJobs;