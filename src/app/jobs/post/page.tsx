"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { saveDraftJob } from "@/redux/jobSlice/jobSlice";
import { CldUploadWidget } from "next-cloudinary";

async function geocodeAddress(address: string) {
  const lat = 20;
  const lng = 30;
  return { lat, lng };
}

export default function PostYourJob() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [logoUrl, setLogoUrl] = useState<string>("");

  if (status === "unauthenticated") redirect("/auth/signin");
  if (!session) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const location = formData.get("location")?.toString();
    const { lat, lng } = await geocodeAddress(location as string);
    const deadlineTime = formData.get("deadline");
    const finalDeadline = new Date(deadlineTime as string);
    finalDeadline.setHours(23, 59, 59, 999);

    const data = {
      title: formData.get("title") as string,
      company: formData.get("company") as string,
      type: formData.get("type") as string,
      website: formData.get("website") as string,
      logo: logoUrl,
      responsibilities: formData.get("responsibilities") as string,
      skills: formData.get("skills") as string,
      jobplace: formData.get("jobplace") as string,
      benefits: formData.getAll("benefits") as string[],
      vacancies: formData.get("vacancies") ? parseInt(formData.get("vacancies") as string) : 1,
      education: formData.get("education") as string,
      salary: formData.get("salary") as string,
      experience: formData.get("experience") as string,
      deadline: finalDeadline.toISOString(),
      location,
      lat,
      lng,
    };

    dispatch(saveDraftJob(data));
    router.push("post/submit");
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-6rem)] sm:h-[calc(100vh-9rem)] mt-4 sm:mt-8">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl ring-1 ring-gray-700 rounded-md sm:rounded-lg shadow-lg px-6 py-2">

        <h1 className="text-lg md:text-2xl font-bold  mb-4 text-center md:text-left">
          Create a Job Post
        </h1>

        <div className="max-h-[calc(100vh-9rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-4 text-sm md:text-base">

            <Input label="Job Title" name="title" required />
            <Input label="Company" name="company" required />

            <div>
              <label className="block text-sm font-medium text-gray-700">Company Logo</label>
              <div className="relative w-28 h-28 md:w-32 md:h-32 border border-gray-300 rounded-lg overflow-hidden mt-2 bg-gray-50 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-gray-400 text-center">No logo uploaded</p>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                    onSuccess={(event: any) => {
                      if (event?.info?.secure_url) setLogoUrl(event.info.secure_url);
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="text-white text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-md"
                      >
                        {logoUrl ? "Change" : "Upload"}
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>
            </div>

            <Select label="Work Type" name="type" options={["Internship", "Part time", "Full time", "Contractual"]} />
            <Textarea label="Responsibilities & Context" name="responsibilities" rows={5} required />

            <Select
              label="Experience"
              name="experience"
              options={[ "Freshers", "6 Months", "0-1 year", "1-2 years", "2-3 years", "3-5 years", "5-8 years", "Above 8 years"]}
              required
            />

            <Input label="Skills" name="skills" required placeholder="e.g., React, Tailwind, Node.js" />
            <Input label="Education" name="education" required placeholder="e.g., BSc in Computer Science" />
            <Input label="Number of Vacancies" name="vacancies" type="number" required />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Compensation & Benefits</p>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                {[ "Salary Review: Yearly", "Lunch Facilities: Partially Subsidize", "5 Days Work Week", "Festival Bonus: 2", "Professional Development", "Snacks, Tea & Coffee", "Health Insurance", "Others",].map((benefit) => (
                  <label key={benefit} className="flex items-center gap-1">
                    <input type="checkbox" name="benefits" value={benefit} />
                    {benefit}
                  </label>
                ))}
              </div>
            </div>

            <Input label="Deadline" name="deadline" type="date" required />
            <Input label="Salary (optional)" name="salary" placeholder="e.g., $30,000 - $45,000" />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Job Location</p>
              <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                {["Work at office", "Work from home", "Hybrid"].map((place, i) => (
                  <label key={i} className="flex items-center gap-1">
                    <input type="radio" name="jobplace" value={place} defaultChecked={i === 0} />
                    {place}
                  </label>
                ))}
              </div>
            </div>

            <Input label="Company Website (optional)" name="website" type="url" placeholder="https://yourcompany.com" />
            <Input label="Company Address" name="location" required />

            <div className="flex justify-end mb-1">
              <button
                type="submit"
                className="bg-black text-white text-sm md:text-base font-medium rounded-full px-4 py-1.5 mt-2 transition-all cursor-pointer"
              >
                Next →
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}


function Input({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className="mt-1 w-full border border-slate-500 rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 focus:ring-gray-400 outline-none transition"
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  rows,
  required = false,
}: {
  label: string;
  name: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        className="mt-1 w-full border border-slate-500 rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 focus:ring-gray-400 outline-none transition"
        name={name}
        id={name}
        rows={rows}
        required={required}
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        className="mt-1 w-full border border-slate-500 rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 focus:ring-gray-400 outline-none transition"
        name={name}
        id={name}
        required={required}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
