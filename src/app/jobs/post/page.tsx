"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { AppDispatch } from "@/redux/store";
import { saveDraftJob } from "@/redux/jobSlice/jobSlice";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-hot-toast";
import { PlusCircle, Building2, ListChecks, FileText, UploadCloud } from "lucide-react";

// Validation schema
interface FormErrors {
  title?: string;
  company?: string;
  type?: string;
  responsibilities?: string;
  skills?: string;
  education?: string;
  experience?: string;
  vacancies?: string;
  deadline?: string;
  location?: string;
  jobplace?: string;
  website?: string;
  salary?: string;
}

interface FormData {
  title: string;
  company: string;
  type: string;
  website: string;
  logo: string;
  responsibilities: string;
  skills: string;
  jobplace: string;
  benefits: string[];
  vacancies: number;
  education: string;
  salary: string;
  experience: string;
  deadline: string;
  location: string;
  lat: number;
  lng: number;
}

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [skillsText, setSkillsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");

  if (status === "unauthenticated") redirect("/auth/signin");
  if (!session) return null;

  // Validation function
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case "title":
        if (!value?.trim()) return "Job title is required";
        if (value.length < 3) return "Job title must be at least 3 characters";
        if (value.length > 200) return "Job title must be less than 200 characters";
        break;
      
      case "company":
        if (!value?.trim()) return "Company name is required";
        if (value.length < 2) return "Company name must be at least 2 characters";
        if (value.length > 100) return "Company name must be less than 100 characters";
        break;
      
      case "type":
        if (!value) return "Work type is required";
        break;
      
      case "responsibilities":
        if (!value?.trim()) return "Responsibilities are required";
        if (value.length < 10) return "Please provide detailed responsibilities (at least 10 characters)";
        break;
      
      case "skills":
        if (!value?.trim()) return "Skills are required";
        if (value.length < 3) return "Please specify required skills";
        break;
      
      case "education":
        if (!value?.trim()) return "Education requirement is required";
        break;
      
      case "experience":
        if (!value) return "Experience level is required";
        break;
      
      case "vacancies":
        if (!value || value === "") return "Number of vacancies is required";
        const vacanciesNum = parseInt(value);
        if (isNaN(vacanciesNum) || vacanciesNum < 1) return "At least 1 vacancy is required";
        if (vacanciesNum > 100) return "Vacancies cannot exceed 100";
        break;
      
      case "salary":
        if (!value?.trim()) return "Salary information is required";
        if (value.length < 3) return "Please provide salary details";
        break;
      
      case "deadline":
        if (!value) return "Application deadline is required";
        const deadline = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadline < today) return "Deadline cannot be in the past";
        break;
      
      case "location":
        if (!value?.trim()) return "Company address is required";
        if (value.length < 5) return "Please provide a valid address";
        break;
      
      case "jobplace":
        if (!value) return "Job location type is required";
        break;
      
      case "website":
        if (value && !isValidUrl(value)) return "Please enter a valid URL";
        break;
    }
    return undefined;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'title', 'company', 'type', 'responsibilities', 
      'skills', 'education', 'experience', 'vacancies', 
      'salary', 'deadline', 'location', 'jobplace'
    ];

    const newErrors: FormErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    // Validate website if provided
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const location = formData.location as string;
      const { lat, lng } = await geocodeAddress(location);
      
      const deadlineTime = formData.deadline;
      const finalDeadline = new Date(deadlineTime as string);
      finalDeadline.setHours(23, 59, 59, 999);

      const data = {
        title: formData.title as string,
        company: formData.company as string,
        type: formData.type as string,
        website: formData.website || "",
        logo: logoUrl,
        responsibilities: formData.responsibilities as string,
        skills: formData.skills as string,
        jobplace: formData.jobplace as string,
        benefits: benefitsText.split(",").map((b) => b.trim()).filter(Boolean),
        vacancies: parseInt(formData.vacancies as any) || 1,
        education: formData.education as string,
        salary: formData.salary as string || "Negotiable",
        experience: formData.experience as string,
        deadline: finalDeadline.toISOString(),
        location,
        lat,
        lng,
      };

      dispatch(saveDraftJob(data));
      toast.success("Job draft saved successfully!");
      router.push("post/submit");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save job draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      'title', 'company', 'type', 'responsibilities', 
      'skills', 'education', 'experience', 'vacancies', 
      'salary', 'deadline', 'location', 'jobplace'
    ];

    return requiredFields.every(field => 
      formData[field as keyof FormData] && 
      !errors[field as keyof FormErrors]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white/70 rounded-lg shadow-md overflow-hidden"
    >
      <div className="text-center mb-3">
        <h1 className="flex items-center justify-center text-lg sm:text-2xl font-semibold text-slate-700 gap-2">
          <PlusCircle className="w-5 h-5 text-green-500" />
          Create Job Post
        </h1>
      </div>

      {/* Logo Upload */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-3xl font-bold">{formData.company?.charAt(0) ?? "C"}</span>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
              onSuccess={(event: any) => {
                if (event?.info?.secure_url) {
                  setLogoUrl(event.info.secure_url);
                  toast.success("Logo uploaded successfully!");
                }
              }}
            >
              {({ open }) => (
                <button type="button" onClick={() => open()} className="flex items-center gap-1 text-white text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full">
                  <UploadCloud className="w-3 h-3" />
                  {logoUrl ? "Change" : "Upload Logo"}
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-h-[75vh] overflow-y-auto px-1 sm:px-3">
        <form onSubmit={handleSubmit} className="space-y-8 text-sm">
          {/* Job Info */}
          <section>
            <h2 className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
              <Building2 className="w-4 h-4 text-orange-500" />
              Job Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                { name: "title", label: "Job Title", type: "text", required: true },
                { name: "company", label: "Company", type: "text", required: true },
                { name: "website", label: "Website", type: "url", required: false },
                { name: "location", label: "Location", type: "text", required: true },
                { name: "type", label: "Type", type: "text", required: true },
                { name: "salary", label: "Salary", type: "text", required: true }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-slate-600 mb-1 text-xs font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.name === "type" ? (
                    <select
                      name={field.name}
                      value={formData[field.name as keyof FormData] as string || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                    >
                      <option value="">Select work type</option>
                      <option value="Internship">Internship</option>
                      <option value="Part time">Part time</option>
                      <option value="Full time">Full time</option>
                      <option value="Contractual">Contractual</option>
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof FormData] as string || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                      placeholder={field.name === "salary" ? "e.g., $30,000 - $45,000" : ""}
                    />
                  )}
                  {errors[field.name as keyof FormErrors] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name as keyof FormErrors]}</p>
                  )}
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
              {[
                { name: "experience", label: "Experience", type: "text", required: true },
                { name: "vacancies", label: "Vacancies", type: "number", required: true },
                { name: "education", label: "Education", type: "text", required: true }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-600 mb-1 text-xs font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.name === "experience" ? (
                    <select
                      name={field.name}
                      value={formData[field.name as keyof FormData] as string || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                    >
                      <option value="">Select experience</option>
                      <option value="Freshers">Freshers</option>
                      <option value="6 Months">6 Months</option>
                      <option value="0-1 year">0-1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-3 years">2-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-8 years">5-8 years</option>
                      <option value="Above 8 years">Above 8 years</option>
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof FormData] as string || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                      min={field.name === "vacancies" ? 1 : undefined}
                      max={field.name === "vacancies" ? 100 : undefined}
                    />
                  )}
                  {errors[field.name as keyof FormErrors] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name as keyof FormErrors]}</p>
                  )}
                </div>
              ))}

              {/* Skills */}
              <div className="sm:col-span-2">
                <label className="block text-gray-600 mb-1 text-xs font-medium">
                  Skills <span className="text-red-500">*</span>
                </label>
                <input
                  name="skills"
                  type="text"
                  value={formData.skills || ""}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  required
                  className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                  placeholder="e.g., React, Tailwind, Node.js"
                />
                {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
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
              <div>
                <label className="block text-gray-600 mb-1 text-xs font-medium">
                  Jobplace <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobplace"
                  value={formData.jobplace || ""}
                  onChange={(e) => handleInputChange('jobplace', e.target.value)}
                  required
                  className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                >
                  <option value="">Select job location</option>
                  <option value="Work at office">Work at office</option>
                  <option value="Work from home">Work from home</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                {errors.jobplace && <p className="text-red-500 text-xs mt-1">{errors.jobplace}</p>}
              </div>

              <div>
                <label className="block text-gray-600 mb-1 text-xs font-medium">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  name="deadline"
                  type="date"
                  value={formData.deadline || ""}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  required
                  className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
                />
                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mt-4">
              <label className="block text-gray-600 mb-1 text-xs font-medium">
                Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                name="responsibilities"
                value={formData.responsibilities || ""}
                onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                required
                className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
              />
              {errors.responsibilities && <p className="text-red-500 text-xs mt-1">{errors.responsibilities}</p>}
            </div>

            {/* Benefits */}
            <div className="mt-4">
              <label className="block text-gray-600 mb-1 text-xs font-medium">
                Benefits
              </label>
              <textarea
                rows={3}
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                placeholder="e.g., Remote work, Paid leave, Health insurance"
                className="border border-slate-500 p-2 rounded-lg w-full focus:ring-1 focus:ring-slate-600 text-sm"
              />
            </div>
          </section>

          <button 
            type="submit" 
            disabled={!isFormValid() || isSubmitting}
            className="w-full bg-slate-700 text-white py-2.5 rounded-lg font-medium hover:bg-black transition text-sm"
          >
            {isSubmitting ? "Processing..." : "Next Step"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}





















// "use client";

// import { useSession } from "next-auth/react";
// import { redirect, useRouter } from "next/navigation";
// import { FormEvent, useState } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/redux/store";
// import { saveDraftJob } from "@/redux/jobSlice/jobSlice";
// import { CldUploadWidget } from "next-cloudinary";

// async function geocodeAddress(address: string) {
//   const lat = 20;
//   const lng = 30;
//   return { lat, lng };
// }

// export default function PostYourJob() {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [logoUrl, setLogoUrl] = useState<string>("");

//   if (status === "unauthenticated") redirect("/auth/signin");
//   if (!session) return null;

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const formData = new FormData(e.currentTarget);
//     const location = formData.get("location")?.toString();
//     const { lat, lng } = await geocodeAddress(location as string);
//     const deadlineTime = formData.get("deadline");
//     const finalDeadline = new Date(deadlineTime as string);
//     finalDeadline.setHours(23, 59, 59, 999);

//     const data = {
//       title: formData.get("title") as string,
//       company: formData.get("company") as string,
//       type: formData.get("type") as string,
//       website: formData.get("website") as string,
//       logo: logoUrl,
//       responsibilities: formData.get("responsibilities") as string,
//       skills: formData.get("skills") as string,
//       jobplace: formData.get("jobplace") as string,
//       benefits: formData.getAll("benefits") as string[],
//       vacancies: formData.get("vacancies") ? parseInt(formData.get("vacancies") as string) : 1,
//       education: formData.get("education") as string,
//       salary: formData.get("salary") as string,
//       experience: formData.get("experience") as string,
//       deadline: finalDeadline.toISOString(),
//       location,
//       lat,
//       lng,
//     };

//     dispatch(saveDraftJob(data));
//     router.push("post/submit");
//   };

//   return (
//     <div className="flex justify-center items-center h-[calc(100vh-6rem)] sm:h-[calc(100vh-9rem)] mt-4 sm:mt-8">
//       <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl ring-1 ring-gray-700 rounded-md sm:rounded-lg shadow-lg px-6 py-2">

//         <h1 className="text-lg md:text-2xl font-bold  mb-4 text-center md:text-left">
//           Create a Job Post
//         </h1>

//         <div className="max-h-[calc(100vh-9rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
//           <form onSubmit={handleSubmit} className="space-y-4 text-sm md:text-base">

//             <Input label="Job Title" name="title" required />
//             <Input label="Company" name="company" required />

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Company Logo</label>
//               <div className="relative w-28 h-28 md:w-32 md:h-32 border border-gray-300 rounded-lg overflow-hidden mt-2 bg-gray-50 flex items-center justify-center">
//                 {logoUrl ? (
//                   <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
//                 ) : (
//                   <p className="text-xs text-gray-400 text-center">No logo uploaded</p>
//                 )}
//                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
//                   <CldUploadWidget
//                     uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
//                     onSuccess={(event: any) => {
//                       if (event?.info?.secure_url) setLogoUrl(event.info.secure_url);
//                     }}
//                   >
//                     {({ open }) => (
//                       <button
//                         type="button"
//                         onClick={() => open()}
//                         className="text-white text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-md"
//                       >
//                         {logoUrl ? "Change" : "Upload"}
//                       </button>
//                     )}
//                   </CldUploadWidget>
//                 </div>
//               </div>
//             </div>

//             <Select label="Work Type" name="type" options={["Internship", "Part time", "Full time", "Contractual"]} />
//             <Textarea label="Responsibilities & Context" name="responsibilities" rows={5} required />

//             <Select
//               label="Experience"
//               name="experience"
//               options={[ "Freshers", "6 Months", "0-1 year", "1-2 years", "2-3 years", "3-5 years", "5-8 years", "Above 8 years"]}
//               required
//             />

//             <Input label="Skills" name="skills" required placeholder="e.g., React, Tailwind, Node.js" />
//             <Input label="Education" name="education" required placeholder="e.g., BSc in Computer Science" />
//             <Input label="Number of Vacancies" name="vacancies" type="number" required />

//             <div>
//               <p className="text-sm font-medium text-gray-700 mb-2">Compensation & Benefits</p>
//               <div className="flex flex-wrap gap-2 text-xs md:text-sm">
//                 {[ "Salary Review: Yearly", "Lunch Facilities: Partially Subsidize", "5 Days Work Week", "Festival Bonus: 2", "Professional Development", "Snacks, Tea & Coffee", "Health Insurance", "Others",].map((benefit) => (
//                   <label key={benefit} className="flex items-center gap-1">
//                     <input type="checkbox" name="benefits" value={benefit} />
//                     {benefit}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <Input label="Deadline" name="deadline" type="date" required />
//             <Input label="Salary (optional)" name="salary" placeholder="e.g., $30,000 - $45,000" />

//             <div>
//               <p className="text-sm font-medium text-gray-700 mb-1">Job Location</p>
//               <div className="flex flex-wrap gap-3 text-xs md:text-sm">
//                 {["Work at office", "Work from home", "Hybrid"].map((place, i) => (
//                   <label key={i} className="flex items-center gap-1">
//                     <input type="radio" name="jobplace" value={place} defaultChecked={i === 0} />
//                     {place}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <Input label="Company Website (optional)" name="website" type="url" placeholder="https://yourcompany.com" />
//             <Input label="Company Address" name="location" required />

//             <div className="flex justify-end mb-1">
//               <button
//                 type="submit"
//                 className="bg-black text-white text-sm md:text-base font-medium rounded-full px-4 py-1.5 mt-2 transition-all cursor-pointer"
//               >
//                 Next →
//               </button>
//             </div>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


// function Input({
//   label,
//   name,
//   type = "text",
//   required = false,
//   placeholder = "",
// }: {
//   label: string;
//   name: string;
//   type?: string;
//   required?: boolean;
//   placeholder?: string;
// }) {
//   return (
//     <div>
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700">
//         {label}
//       </label>
//       <input
//         className="mt-1 w-full border border-slate-500 rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 focus:ring-gray-400 outline-none transition"
//         type={type}
//         name={name}
//         id={name}
//         placeholder={placeholder}
//         required={required}
//       />
//     </div>
//   );
// }

// function Textarea({
//   label,
//   name,
//   rows,
//   required = false,
// }: {
//   label: string;
//   name: string;
//   rows: number;
//   required?: boolean;
// }) {
//   return (
//     <div>
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700">
//         {label}
//       </label>
//       <textarea
//         className="mt-1 w-full border border-slate-500 rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 focus:ring-gray-400 outline-none transition"
//         name={name}
//         id={name}
//         rows={rows}
//         required={required}
//       />
//     </div>
//   );
// }

// function Select({
//   label,
//   name,
//   options,
//   required = false,
// }: {
//   label: string;
//   name: string;
//   options: string[];
//   required?: boolean;
// }) {
//   return (
//     <div>
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700">
//         {label}
//       </label>
//       <select
//         className="mt-1 w-full border border-slate-500 rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 focus:ring-gray-400 outline-none transition"
//         name={name}
//         id={name}
//         required={required}
//       >
//         <option value="">Select an option</option>
//         {options.map((opt) => (
//           <option key={opt} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }
