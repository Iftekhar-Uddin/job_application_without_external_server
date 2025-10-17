import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const recentJobs = await prisma.job.findMany({
    take: 3,
    orderBy: {
      postedAt: "desc",
    },
    include: {
      postedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto md:space-y-12 max-w-7xl">
      {/* Hero Section */}
      <section className="text-center py-1 md:py-16 bg-amber-100 rounded-sm md:rounded-lg shadow-sm ring-1 ring-orange-300">
        <h1 className="text-lg md:text-3xl font-semibold md:font-bold text-orange-500 md:mb-4">
          Find Your Dream Job
        </h1>
        {/* <hr className="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 dark:via-neutral-400 z-0" /> */}
        <p className="text-sm md:text-xl mb-2 md:mb-8">
          Discover thousands of job opportunities with top companies
        </p>
        <Link
          href="/jobs"
          className="bg-black text-white px-3 md:px-6 py-1 md:py-3 rounded-sm md:rounded-md text-sm md:text-lg font-medium"
        >
          Browse Jobs
        </Link>
      </section>

      {/* Recent Jobs Section */}
      <section>
        <div className="grid gap-2 md:gap-6 md:grid-cols-2 lg:grid-cols-3 mt-2 md:mt-4">
          {recentJobs.map((job) => (
            <div
              // href={`/jobs/${job.id}`}
              key={job.id}
              className="p-2 md:p-6 rounded-sm md:rounded-lg shadow-sm hover:shadow-md md:disabled transition-shadow bg-amber-100"
            >
              <h3 className="md:text-xl font-semibold text-orange-500">
                {job.title}
              </h3>
              <p className="text-emerald-600 md:mb-2 text-xs">{job.company}</p>
              <div className="flex text-sm md:text-base my-2 md:min-h-12">
                <span className="mr-2 text-blue-500">{job.location}</span>
                <div className="inline-block h-[19px] md:h-[22px] min-h-[0.5em] w-0.5 self-stretch bg-neutral-400 dark:bg-white/10"></div>
                <span className="ml-2 text-red-500">{job.type}</span>
              </div>
              <p className="text-sm md:text-base md:mb-4 line-clamp-2">
                {job?.responsibilities}
              </p>
              <Link href={`/jobs/${job.id}`}
                className="text-gray-500 text-xs md:text-base flex justify-end hover:text-gray-800 font-medium mt-2"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-2 md:mt-8">
          <Link
            href="/jobs"
            className="text-white md:text-xl font-medium hover:text-amber-100"
          >
            View All Jobs →
          </Link>
        </div>
      </section>
    </div>
  );
}
