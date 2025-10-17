"use client"

import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useState } from "react"

type DashboardProps = {
  postedJobs: any;
  applications: any;
};


const Dashboard = ({ postedJobs, applications }: DashboardProps) => {
  const [isPostedJob, setIsPostedJob] = useState(true);
  const [isapplications, setIsapplications] = useState(false);


  const handleAvailableJobs = () => {
    setIsPostedJob(!isPostedJob);
    setIsapplications(!isapplications);
  };

  const handleApplications = () => {
    setIsapplications(!isapplications);
    setIsPostedJob(!isPostedJob);
  };


  return (
    <div className="max-w-7xl mx-auto rounded-md sm:px-6 lg:px-0 min-h-[calc(100vh-10rem)]">

      <div className="ring-1 ring-orange-500 rounded-sm md:rounded-md flex flex-col mb-1.5 md:mb-1.5 pt-0 md:pt-1 font-sans bg-amber-100">
        <h1 className=" md:text-xl md:font-semibold flex justify-center">
          Dashboard
        </h1>
        <div className="flex justify-around items-center pb-1">
          <button disabled={isPostedJob} onClick={handleAvailableJobs} className={`${isPostedJob ? "underline" : ""}   md:text-base text-red-500 rounded-sm text-sm font-semibold md:underline`}>Post you have</button>
          <button disabled={isapplications} onClick={handleApplications} className={`${isapplications ? "underline" : ""}  md:text-base text-green-600 rounded-sm font-semibold text-sm md:underline`}>Your Applications</button>
        </div>
      </div>

      <div className="grid md:gap-2 md:grid-cols-2">

        {/* Posted Jobs Section */}
        <div className='ring-1 ring-orange-500 rounded-sm md:rounded-md shadow-sm md:px-2 bg-amber-100'>
          <div className="max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-15rem)] overflow-y-auto divide-y divide-gray-300">
            {postedJobs?.length === 0 ? (
              <p className={`${isPostedJob ? "block" : "hidden"} p-6 text-red-600 text-center md:block`}>
                You haven't posted any jobs yet.
              </p>
            ) : (
              postedJobs?.map((job: any) => (
                <div key={job.id} className={`${isPostedJob ? "block" : "hidden"} md:p-4 p-3 md:block`}>
                  <div className="flex justify-between items-start md:gap-x-4">
                    <div>
                      <h3 className="md:text-lg md:mb-1 text-orange-500">
                        {job.title}
                      </h3>
                      <p className="text-sm md:text-base md:mb-2 text-green-500">{job.company}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Link href={`/applicants/${job.id}`} className="px-2 py-1 rounded-full text-xs text-orange-500  hover:text-white hover:bg-black ring-1">
                        {job._count.applications} applications
                      </Link>
                    </div>
                  </div>
                  <div className="md:flex md:items-center text-sm md:text-base md:gap-x-2 mt-2 md:mt-0 text-gray-600">
                    <span className="">{job.type}</span>
                    <span className="mx-2">•</span>
                    <span className="">{job.location}</span>
                    <span className="mx-2">•</span>
                    <span className="">
                      {formatDistanceToNow(new Date(job.postedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end space-x-4">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="hover:text-blue-600 text-sm font-medium underline"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applications Section */}
        <div className='ring-1 ring-orange-500 rounded-sm md:rounded-lg shadow-sm md:px-2 bg-amber-100'>
          <div className="max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-15rem)] overflow-y-auto divide-y divide-gray-300">
            {applications?.length === 0 ? (
              <p className={`${isapplications ? "block" : "hidden"} p-6 text-green-600 text-center md:block`}>
                You haven't applied to any jobs yet.
              </p>
            ) : (
              applications?.map((application: any) => (
                <div key={application?.id} className={`${isapplications ? "block" : "hidden"} md:p-4 p-3 md:block `}>


                  <div className="flex justify-between items-start md:gap-x-4">
                    <div>
                      <h3 className="md:text-lg md:mb-1 text-orange-500">
                        {application?.job?.title}
                      </h3>
                      <p className="text-sm md:text-base text-emerald-600 md:mb-2">{application?.job?.company}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black ${application?.status === "Reviewing"
                          ? "text-yellow-400"
                          : application.status === "Accepted"
                            ? "text-green-400"
                            : application.status === "Rejected"
                            ? "text-red-500"
                            : "text-white"
                          }`}
                      >
                        {application?.status}
                      </span>
                    </div>
                  </div>

                  <div className="md:flex md:items-center text-sm md:text-base md:gap-x-2 mt-2 md:mt-0 text-gray-600">
                    <span>{application?.job?.location}</span>
                    <span className="mx-2">•</span>
                    <span>{application?.job?.type}</span>
                    <span className="mx-2">•</span>
                    <span>
                      Applied{" "}
                      {formatDistanceToNow(
                        new Date(application?.appliedAt),
                        {
                          addSuffix: true,
                        }
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end space-x-4">
                    <Link
                      href={`/jobs/${application.job.id}`}
                      className="hover:text-blue-600 text-sm font-medium underline"
                    >
                      View Job
                    </Link>
                  </div>


                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;