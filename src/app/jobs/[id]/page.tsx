import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplyButton from "./ApplyButton";
import { formatDistanceToNow } from "date-fns";


const jobDetails = async ({ params }: { params: Promise<{ id: string }> }) => {

  const jobId = (await params).id;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { postedBy: true },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="bg-amber-100 max-w-7xl mx-auto h-fit rounded-lg ">
      <div className="p-6 grid grid-rows-1 gap-y-4 w-full">
        <div className="flex justify-between">
          <Link
            href={"/jobs"}
            className="cursor-pointer text-cyan-800 underline"
          >
            Goto Back
          </Link>
          <h2 className="text-red-400">Deadline: {new Date(job?.deadline as Date).toLocaleDateString('en-GB')}</h2>
        </div>

        <div className="flex w-full">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold text-orange-500">
              {job.title}
            </h1>
            <p className="text-blue-400 text-sm md:text-base">
              {job.company}
            </p>
            <div className="md:flex justify-between pt-4">
              <div className="md:space-y-2 md:w-1/2 font-sans space-y-1">
                <p className="md:font-semibold md:text-lg text-gray-600">
                  <span>Vacancy: </span>
                  {job?.vacancies}
                </p>
                <p className="md:font-semibold md:text-lg text-green-500">
                  <span>Employment Status: </span>
                  {job.type}
                </p>
                <p className="md:font-semibold md:text-lg">
                  <span>Salary: </span>
                  {job.salary} /=
                </p>
              </div>
              <div className="md:space-y-2 space-y-1 mt-1 md:w-1/2 font-sans">
                <p className="md:font-semibold md:text-lg">
                  <span>Education: {job?.education} </span>
                </p>
                <p className="md:font-semibold text-red-400 md:text-lg">
                  <span>Experience: {job?.experience ? job?.experience : "No Need"} </span>
                </p>
                <p className="text-[min(10vw, 120px)] text-gray-600 ">
                  <span className="underline underline-offset-2 text-blue-400 md:font-semibold">Requirement Skills:</span>
                  &nbsp;{job?.skills}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="pt-2 grid-cols-1 grid text-gray-700 font-sans text-justify md:text-base">
          <span className="font-semibold md:text-lg mb-1 ">Responsibilities & Context: </span>
          {job?.responsibilities}
        </p>
        <p className="text-orange-500 md:font-semibold">
          <span className="">Workplace: </span>
          {job?.jobplace}
        </p>
        <ul>
          <p className="md:font-semibold md:text-lg text-teal-500 mb-1">Compansation & Others:</p>
          {job?.benefits.map((single) =>
            <li key={single} className="text-gray-600 list-inside list-disc">{single}</li>)}
        </ul>
        <div className="md:flex justify-between items-center font-sans">

          {/* <div className="w-2/5 flex justify-end">
            <div className="">
              {job.postedBy.image && (
                <Image
                  className="size-32"
                  src={job.postedBy.image}
                  height={650}
                  width={366}
                  alt=""
                  priority={!!getPriority}
                />
              )}
              <p className="font-sans text-xs">
                <span className="">PostedBy: </span>
                {job?.postedBy?.name}
              </p>
            </div>
          </div> */}

          <p className="text-gray-600">
            <span className="font-semibold">Location: </span>
            {job.location}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Published: </span>
            {formatDistanceToNow(new Date(job?.postedAt), { addSuffix: true })}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">PostedBy: </span>
            {job?.postedBy?.name} &nbsp;
          </p>
        </div>

        <div className="flex justify-end">
          <ApplyButton jobId={job.id} />
        </div>

      </div>
    </div>
  );
};

export default jobDetails;
