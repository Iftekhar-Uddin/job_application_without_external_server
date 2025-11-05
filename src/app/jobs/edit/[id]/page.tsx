"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-hot-toast";
import {
  PencilLine,
  Building2,
  ListChecks,
  FileText,
  UploadCloud,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  logo?: string;
  website?: string;
  location: string;
  type: string;
  responsibilities?: string;
  salary?: string;
  experience?: string;
  vacancies: number;
  skills?: string;
  education?: string;
  benefits?: string[];
  jobplace?: string;
  deadline?: string;
};

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({});

  const [skillsText, setSkillsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/job/${id}/edit`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();

        setJob(data);
        setFormData({
          ...data,
          responsibilities: data.responsibilities || "",
          vacancies: Number(data.vacancies) || 0,
          deadline: data.deadline?.split("T")[0] || "",
        });

        setSkillsText(data.skills || "");
        setBenefitsText(Array.isArray(data.benefits) ? data.benefits.join(", ") : "");
      } catch (err) {
        console.error("Error fetching job:", err);
        toast.error("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "vacancies" ? Number(value) || 0 : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities || "",
        skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean).join(","),
        benefits: benefitsText.split(",").map((b) => b.trim()).filter(Boolean),
        vacancies: Number(formData.vacancies) || 0,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
      };

      const res = await fetch(`/api/job/${id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update job");
      toast.success("Job updated successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update job");
    } finally {
      setUpdating(false);
    }
  };

if (loading)
  return (
    <div className="max-w-7xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white/70 rounded-sm sm:rounded-lg">
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-32 bg-slate-300/60 rounded"></div>
          <div className="h-4 w-20 bg-slate-200/60 rounded"></div>
        </div>

        {/* Logo placeholder */}
        <div className="flex justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-200/70"></div>
        </div>

        {/* Job Info Section */}
        <div className="bg-white/70 rounded-lg shadow p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-300 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-full bg-slate-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white/70 rounded-lg shadow p-6 space-y-4">
          <div className="h-5 w-36 bg-slate-300 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-full bg-slate-200 rounded-md"></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
            <div className="h-20 w-full bg-slate-200 rounded-md"></div>
          </div>
        </div>

        {/* Job Details Section */}
        <div className="bg-white/70 rounded-lg shadow p-6 space-y-4">
          <div className="h-5 w-32 bg-slate-300 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-full bg-slate-200 rounded-md"></div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-20 w-full bg-slate-200 rounded-md"></div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-40 bg-slate-200 rounded"></div>
            <div className="h-16 w-full bg-slate-200 rounded-md"></div>
          </div>
        </div>

        {/* Button Placeholder */}
        <div className="h-10 w-full bg-slate-300 rounded-md"></div>
      </div>
    </div>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white/70 rounded-lg shadow-md overflow-hidden"
    >
      <div className="text-center mb-3">
        <h1 className="flex items-center justify-center text-lg sm:text-2xl font-semibold text-slate-700 gap-2">
          <PencilLine className="w-5 h-5 text-orange-500" />
          Edit Job
        </h1>
      </div>

      {/* Logo Upload */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
          {formData.logo ? (
            <img src={formData.logo} alt={formData.company} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-3xl font-bold">{formData.company?.charAt(0) ?? "U"}</span>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
              onSuccess={(event: any) => {
                if (event?.info?.secure_url) {
                  setFormData((prev) => ({ ...prev, logo: event.info.secure_url }));
                }
              }}
            >
              {({ open }) => (
                <button type="button" onClick={() => open()} className="flex items-center gap-1 text-white text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full">
                  <UploadCloud className="w-3 h-3" />
                  Change Logo
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-h-[75vh] overflow-y-auto px-1 sm:px-3">
        <form onSubmit={handleUpdate} className="space-y-8 text-sm">
          {/* Job Info */}
          <section>
            <h2 className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
              <Building2 className="w-4 h-4 text-orange-500" />
              Job Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {["title", "company", "website", "location", "type", "salary"].map((field) => (
                <div key={field}>
                  <label className="block text-slate-600 mb-1 text-xs font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input name={field} value={(formData as any)[field] || ""} onChange={handleChange} className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm" />
                </div>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section>
            <h2 className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
              <ListChecks className="w-4 h-4 text-green-500" />
              Requirements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {["experience", "vacancies", "education"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-600 mb-1 text-xs font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input name={field} type={field === "vacancies" ? "number" : "text"} value={(formData as any)[field] || ""} onChange={handleChange} className="border border-slate-500 p-2 rounded-lg w-full text-sm" />
                </div>
              ))}

              {/* Skills */}
              <div className="sm:col-span-2">
                <label className="block text-gray-600 mb-1 text-xs font-medium">Skills (comma-separated)</label>
                <textarea rows={3} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} className="border border-slate-500 p-2 rounded-lg w-full text-sm focus:ring-1 focus:ring-slate-600" />
              </div>
            </div>
          </section>

          {/* Job Details */}
          <section>
            <h2 className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <FileText className="w-4 h-4 text-blue-500" />
              Job Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["jobplace", "deadline"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-600 mb-1 text-xs font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input name={field} type={field === "deadline" ? "date" : "text"} value={(formData as any)[field] || ""} onChange={handleChange} className="border border-slate-500 p-2 rounded-lg w-full text-sm" />
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="mt-4">
              <label className="block text-gray-600 mb-1 text-xs font-medium">Responsibilities</label>
              <textarea rows={4} name="responsibilities" value={formData.responsibilities || ""} onChange={handleChange} className="border border-slate-500 p-2 rounded-lg w-full text-sm" />
            </div>

            {/* Benefits */}
            <div className="mt-4">
              <label className="block text-gray-600 mb-1 text-xs font-medium">Benefits (comma-separated)</label>
              <textarea rows={3} value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} placeholder="e.g. Remote work, Paid leave, Health insurance" className="border border-slate-500 p-2 rounded-lg w-full text-sm focus:ring-1 focus:ring-slate-600" />
            </div>
          </section>

          <button type="submit" disabled={updating} className="w-full bg-slate-700 text-white py-2.5 rounded-lg font-medium hover:bg-black transition text-sm">
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}




