import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplyButton from "./ApplyButton";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  CalendarClock,
  BrainCog,
  DollarSign,
  Briefcase,
} from "lucide-react";

const JobDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const jobId = (await params).id;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { postedBy: true },
  });

  if (!job) notFound();

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 bg-white/70 rounded-xl shadow-sm border border-gray-400">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <Link
          href="/jobs"
          className="text-cyan-700 text-sm hover:text-cyan-900 underline underline-offset-2"
        >
          Back to Jobs
        </Link>
        <h2 className="text-sm sm:text-base text-red-500 font-semibold mt-2 sm:mt-0">
          Deadline:{" "}
          <span className="font-bold">
            {new Date(job.deadline as Date).toLocaleDateString("en-GB")}
          </span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        {job.logo && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={job?.logo}
              alt={`${job?.company} logo`}
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">
            {job.title}
          </h1>
          <p className="text-blue-500 font-medium text-sm sm:text-base">
            {job.company}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 font-sans">
        <div className="space-y-1">
          <p className="flex items-center gap-1">
            <Briefcase size={16} className="text-blue-500" />
            <span className="font-semibold">Vacancy:</span> {job.vacancies}
          </p>
          <p className="flex items-center gap-1">
            <Briefcase size={16} className="text-green-600" />
            <span className="font-semibold">Employment Status:</span>{" "}
            {job.type}
          </p>
          <p className="flex items-center gap-1">
            <DollarSign size={16} className="text-green-600" />
            <span className="font-semibold">Salary:</span> {job.salary || "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="flex items-center gap-1">
            <MapPin size={16} className="text-red-500" />
            <span className="font-semibold">Location:</span> {job.location}
          </p>
          <p className="flex items-center gap-1 text-red-500">
            <BrainCog size={16} className="text-blue-500" />
            <span className="font-semibold">Experience:</span>{" "}
            {job.experience || "Not Required"}
          </p>
          <p className="text-sm sm:text-base">
            <span className="underline text-blue-600 font-semibold">
              Required Skills:
            </span>{" "}
            {job.skills}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg text-gray-800">
          Responsibilities & Context:
        </h3>
        <p className="text-gray-700 text-justify leading-relaxed">
          {job.responsibilities}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg text-teal-600">
          Compensation & Benefits
        </h3>
        <ul className="list-disc list-inside text-gray-700">
          {job.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
        <p>
          <span className="font-semibold">Workplace:</span> {job.jobplace}
        </p>
        <p>
          <span className="font-semibold">Published:</span>{" "}
          {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
        </p>
        <p>
          <span className="font-semibold">Posted By:</span>{" "}
          {job.postedBy?.name || "Unknown"}
        </p>
      </div>

      <div className="flex justify-end mt-4">
        <ApplyButton
          jobId={job.id}
        />
      </div>
    </section>
  );
};

export default JobDetails;
