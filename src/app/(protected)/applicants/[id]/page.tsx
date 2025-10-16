import StatusButton from "@/components/StatusButton";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";


const applicats = async ({ params }: { params: Promise<{ id: string }> }) => {
  const jobId = (await params).id;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { postedBy: true },
  });

  if (!job) {
    notFound();
  };


  const applicants = await prisma.application.findMany({
    where: {
      jobId: jobId
    },
    include: {
      user: true
    },
    orderBy: { appliedAt: 'desc' },
  });

  let today = new Date();
  const deadline = new Date(job.deadline as Date);

  // Difference in milliseconds
  const diffInMs: number = deadline.getTime() - today.getTime();

  // Convert to full days
  const remainingDays: number = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));



  return (
    <div className="max-w-7xl mx-auto rounded-md sm:px-6 lg:px-0 h-[calc(100-10rem)]">
      <div className="bg-amber-100 rounded-sm md:rounded-lg flex flex-col mb-3 pt-1">
        <h1 className="text-center text-lg md:text-2xl rounded-lg text-orange-500 underline dashed mx-auto md:px-8 md:my-4 py-1 md:py-2 font-semibold">Posted job overview</h1>
        <div className="p-3 md:p-6 grid md:grid-cols-3">
          <div>
            <h1 className="text-orange-500 text-lg md:text-2xl">{job.title}</h1>
            <p className="text-blue-500">Type: {job.type}</p>
            <p className="">Salary: {job.salary} Tk</p>
          </div>
          <div>
            <p className="text-red-500">Vacancy: {job.vacancies}</p>
            <p className="text-blue-500">Remaining: {remainingDays} days </p>
            <p className="">Experience: {job.experience}</p>
          </div>

          <div>
            <p className="text-orange-500">Work place: {job.jobplace}</p>
            <p className="text-blue-500">Job location: {job.location}</p>
            <p className="">Education:{job.education}</p>
          </div>
          <label className="md:col-span-3 md:mt-2 text-green-500">Required Skills: <p className=" font-sans inline-flex md:inline-block">{job.skills}</p></label>
        </div>
        <hr className="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

        <h1 className="pl-4 md:pl-6 text-lg text-cyan-700 md:text-xl underline decoration-1">Applicants Information:</h1>

        {applicants.map((applicant) => (
          <div className="px-4 md:pl-6 py-2 w-full flex flex-col min-h-fit" key={applicant.id}>
            <div className="md:grid md:grid-cols-4 md:gap-2 bg-amber-100 w-full rounded-lg p-2 ring-1">
              <div className="flex w-full items-center justify-center">
                <Image className="h-32 w-full rounded-md flex justify-center items-center" src={"https://windows10spotlight.com/wp-content/uploads/2025/08/9a970752cabdf1a371c93d0dfc7d3e00.jpg"} height={400} width={600} alt="" loading="lazy" />
              </div>
              <hr className="my-2 h-0.5 border-t-0 bg-neutral-300 dark:bg-white/10 md:hidden" />
              <div className="w-full flex flex-col">
                <h1 className="text-orange-500">Name: {applicant?.user?.name}</h1>
                <p className="text-wrap wrap-anywhere">Email: {applicant?.user?.email}</p>
                <p className="text-green-500">Education: Bachelor of science in CSE</p>
                <p className="text-blue-500">Experience: 3 years</p>
              </div>
              <p className=" text-gray-600">Skills: Node.js, Python, MongoDB, React, Next.js, Prisma, Jest, Docker, Git-repository, Express.js, API Integration, etc.</p>
              <div className="w-full flex flex-col">
                <p className="text-gray-600">Previous institute: Impel IT Solutions</p>
                <h1 className="text-orange-500">Applied At: {new Date(applicant?.appliedAt as Date).toLocaleDateString('en-GB')}</h1>
                <label className="font-serif">Status: <span className={` bg-black rounded-xs ring-1 py-0.5 px-1.5 text-sm ${applicant.status == "Reviewing" ? "text-yellow-500" : `${applicant.status == "Accepted" ? "text-green-500 " : `${applicant.status == "Rejected" ? "text-red-500 " : "text-white"}`}`}`}>{applicant.status}</span></label>
                <StatusButton applicationId={applicant.id} jobId={job.id} applicant={applicant} job={job}/>
              </div>
            </div>
          </div>))}
      </div>
    </div>
  )
}

export default applicats;