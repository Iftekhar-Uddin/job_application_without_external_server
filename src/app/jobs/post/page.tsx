"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { saveDraftJob } from "@/redux/jobSlice/jobSlice";
import { CldUploadWidget } from "next-cloudinary";

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
        benefits: formData.benefits || [],
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
      router.push("post/submit");
    } catch (error) {
      console.error("Form submission error:", error);
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
    <div className="flex justify-center items-center h-[calc(100vh-6rem)] sm:h-[calc(100vh-9rem)] mt-4 sm:mt-8">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl ring-1 ring-gray-700 rounded-md sm:rounded-lg shadow-lg px-6 py-2">

        <h1 className="text-lg md:text-2xl font-bold mb-4 text-center md:text-left">
          Create a Job Post
        </h1>

        <div className="max-h-[calc(100vh-9rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-4 text-sm md:text-base">

            <Input 
              label="Job Title" 
              name="title" 
              required 
              error={errors.title}
              onChange={(value) => handleInputChange('title', value)}
            />
            
            <Input 
              label="Company" 
              name="company" 
              required 
              error={errors.company}
              onChange={(value) => handleInputChange('company', value)}
            />

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

            <Select 
              label="Work Type" 
              name="type" 
              options={["Internship", "Part time", "Full time", "Contractual"]} 
              error={errors.type}
              onChange={(value) => handleInputChange('type', value)}
            />
            
            <Textarea 
              label="Responsibilities & Context" 
              name="responsibilities" 
              rows={5} 
              required 
              error={errors.responsibilities}
              onChange={(value) => handleInputChange('responsibilities', value)}
            />

            <Select
              label="Experience"
              name="experience"
              options={["Freshers", "6 Months", "0-1 year", "1-2 years", "2-3 years", "3-5 years", "5-8 years", "Above 8 years"]}
              required
              error={errors.experience}
              onChange={(value) => handleInputChange('experience', value)}
            />

            <Input 
              label="Skills" 
              name="skills" 
              required 
              placeholder="e.g., React, Tailwind, Node.js" 
              error={errors.skills}
              onChange={(value) => handleInputChange('skills', value)}
            />
            
            <Input 
              label="Education" 
              name="education" 
              required 
              placeholder="e.g., BSc in Computer Science" 
              error={errors.education}
              onChange={(value) => handleInputChange('education', value)}
            />
            
            <NumberInput 
              label="Number of Vacancies" 
              name="vacancies" 
              required 
              error={errors.vacancies}
              onChange={(value) => handleInputChange('vacancies', value)}
              min={1}
              max={100}
            />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Compensation & Benefits</p>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                {["Salary Review: Yearly", "Lunch Facilities: Partially Subsidize", "5 Days Work Week", "Festival Bonus: 2", "Professional Development", "Snacks, Tea & Coffee", "Health Insurance", "Others"].map((benefit) => (
                  <label key={benefit} className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      name="benefits" 
                      value={benefit} 
                      onChange={(e) => {
                        const currentBenefits = formData.benefits || [];
                        const newBenefits = e.target.checked
                          ? [...currentBenefits, benefit]
                          : currentBenefits.filter(b => b !== benefit);
                        handleInputChange('benefits', newBenefits);
                      }}
                    />
                    {benefit}
                  </label>
                ))}
              </div>
            </div>

            <Input 
              label="Deadline" 
              name="deadline" 
              type="date" 
              required 
              error={errors.deadline}
              onChange={(value) => handleInputChange('deadline', value)}
            />
            
            <Input 
              label="Salary" 
              name="salary" 
              required
              placeholder="e.g., $30,000 - $45,000" 
              error={errors.salary}
              onChange={(value) => handleInputChange('salary', value)}
            />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Job Location</p>
              <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                {["Work at office", "Work from home", "Hybrid"].map((place, i) => (
                  <label key={i} className="flex items-center gap-1">
                    <input 
                      type="radio" 
                      name="jobplace" 
                      value={place} 
                      defaultChecked={i === 0}
                      onChange={(e) => handleInputChange('jobplace', e.target.value)}
                    />
                    {place}
                  </label>
                ))}
              </div>
              {errors.jobplace && <p className="text-red-500 text-xs mt-1">{errors.jobplace}</p>}
            </div>

            <Input 
              label="Company Website (optional)" 
              name="website" 
              type="url" 
              placeholder="https://yourcompany.com" 
              error={errors.website}
              onChange={(value) => handleInputChange('website', value)}
            />
            
            <Input 
              label="Company Address" 
              name="location" 
              required 
              error={errors.location}
              onChange={(value) => handleInputChange('location', value)}
            />

            <div className="flex justify-end mb-1">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={`${
                  isFormValid() 
                    ? "bg-black text-white hover:bg-gray-800 cursor-pointer" 
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                } text-sm md:text-base font-medium rounded-full px-4 py-1.5 mt-2 transition-all`}
              >
                {isSubmitting ? "Processing..." : "Next →"}
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
  error,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`mt-1 w-full border rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 outline-none transition ${
          error ? "border-red-500 focus:ring-red-300" : "border-slate-500 focus:ring-gray-400"
        }`}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function NumberInput({
  label,
  name,
  required = false,
  placeholder = "",
  error,
  onChange,
  min,
  max,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`mt-1 w-full border rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 outline-none transition ${
          error ? "border-red-500 focus:ring-red-300" : "border-slate-500 focus:ring-gray-400"
        }`}
        type="number"
        name={name}
        id={name}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Textarea({
  label,
  name,
  rows,
  required = false,
  error,
  onChange,
}: {
  label: string;
  name: string;
  rows: number;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        className={`mt-1 w-full border rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 outline-none transition ${
          error ? "border-red-500 focus:ring-red-300" : "border-slate-500 focus:ring-gray-400"
        }`}
        name={name}
        id={name}
        rows={rows}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required = false,
  error,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`mt-1 w-full border rounded-md px-3 py-1.5 text-gray-800 text-sm focus:ring-1 outline-none transition ${
          error ? "border-red-500 focus:ring-red-300" : "border-slate-500 focus:ring-gray-400"
        }`}
        name={name}
        id={name}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
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
