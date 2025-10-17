"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FormEvent } from "react";

async function geocodeAddress(address: string) {
  // const apikey = process.env.GOOGLE_MAPS_API_KEY;
  // const response = await fetch(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     address
  //   )}&key=${apikey}`
  // );
  // const data = await response.json();
  // console.log(data)
  // const {lat, lng} = data?.result[0]?.geometry?.location;
  const lat = 20;
  const lng = 30
  return { lat, lng }
}

const PostYourJob = (e:any) => {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const location = formData.get("location")?.toString();
    const { lat, lng } = await geocodeAddress(location as string);
    const deadlineTime = formData.get("deadline");
    const finalDeadline = new Date(deadlineTime as string);
    finalDeadline.setHours(23, 59, 59, 999); // Set to the end of the day (11:59:59.999 PM)
    // console.log(finalDeadline.toISOString());
    // const jobplace = formData.get("jobplace");
    // const benefits = formData.getAll("benefits");
    // const experience = formData.get("experience");
    // const requirements = `Skills: ${formData.get("skills")}, Education: ${formData.get("education")}, Vacancies: ${formData.get("vacancies")}`;
    // const salary = formData.get("salary")?.toString() || "Not disclosed";


    const data = {
      title: formData.get("title"),
      company: formData.get("company"),
      type: formData.get("type"),
      responsibilities: formData.get("responsibilities"),
      skills: formData.get("skills"),
      jobplace : formData.get("jobplace"),
      benefits : formData.getAll("benefits"),
      vacancies: formData.get("vacancies" as string) ? parseInt(formData.get("vacancies") as string) : 0,
      education: formData.get("education"),
      salary: formData.get("salary"),
      location: formData.get("location"),
      experience: formData.get("experience"),
      deadline: finalDeadline,
      lat: lat,
      lng: lng
    };

    try {
      await fetch("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      window.location.href = "/jobs";
    } catch (err) {
      console.log(err);
    }
  };


  {if(session){
    return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="min-w-xxs w-lg mx-auto md:p-4 bg-amber-100 rounded-md md:rounded-xl ring-1 ring-orange-500">
        <h1 className="md:text-2xl font-bold text-orange-500 ml-2 mt-2">Create a job post</h1>
        <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-14rem)] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-amber-100">

          <form className="space-y-1.5 md:space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Job Title
              </label>
              <input
                className="block mt-1 w-full border text-sm md:text-md  border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                type="text"
                name="title"
                id="title"
                required
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm text-gray-700"
              >
                Company
              </label>
              <input
                className="block mt-1 w-full border text-sm md:text-md border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                type="text"
                name="company"
                id="company"
                required
              />
            </div>
            <div>
              <label
                htmlFor="title"
                className="block text-sm text-gray-700"
              >
                Work Type
              </label>
              <select
                className="block mt-1 w-full border text-sm md:text-md border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                name="type"
                id="type"
                required
              >
                <option value="">Select a type</option>
                <option value="Internhip">Internhip</option>
                <option value="Part time">Part time</option>
                <option value="Full time">Full time</option>
                <option value="Contractual">Contractual</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="responsibilities"
                className="block text-sm text-gray-700"
              >
                Responsibilities & Context
              </label>
              <textarea
                className="block mt-1 w-full border text-sm md:text-md border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                name="responsibilities"
                id="responsibilities"
                rows={6}
                required
              />
            </div>
            <div>
              <label
                htmlFor="title"
                className="block text-sm text-gray-700"
              >
                Experience
              </label>
              <select
                className="block mt-1 w-full border text-sm md:text-md border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                name="experience"
                id="experience"
                required
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
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm">Skills</label>
              <input
                className="block w-full p-2 border text-sm md:text-md rounded-md text-gray-800 border-gray-400 focus: outline-none mt-1 focus:ring-1 focus:ring-cyan-700"
                type="text"
                name="skills"
                id="skills"
                required
              />
            </div>
            <div>
              <label htmlFor="education" className="block text-sm">Education</label>
              <input
                className="block w-full p-2 border text-sm md:text-md rounded-md text-gray-800 border-gray-400 focus: outline-none mt-1 focus:ring-1 focus:ring-cyan-700"
                type="text"
                name="education"
                id="education"
                required
              />
            </div>
            <div>
              <label htmlFor="vacancies" className="block text-sm md:text-md">Number of Vacancies</label>
              <input
                className="block w-full p-2 border text-sm md:text-md rounded-md text-gray-800 border-gray-400 focus: outline-none mt-1 focus:ring-1 focus:ring-cyan-700"
                type="number"
                name="vacancies"
                id="vacancies"
                required
              />
            </div>
            <div>
              <p className="my-2 text-sm">Compansation & Benifits:</p>
              <input type="checkbox" id="Salary Review: Yearly" name="benefits" value="Salary Review: Yearly" />
              <label htmlFor="Salary Review: Yearly" className="px-2 text-sm md:text-md">Salary Review: Yearly</label>
              <input type="checkbox" id="Lunch Facilities: Partially Subsidize" name="benefits" value="Lunch Facilities: Partially Subsidize" />
              <label htmlFor="Lunch Facilities: Partially Subsidize" className="px-2 text-sm md:text-md">Lunch Facilities: Partially Subsidize</label>
              <input type="checkbox" id="Duty Schedule: 5 days (Sun - Thu)" name="benefits" value="Duty Schedule: 5 days (Sun - Thu)" />
              <label htmlFor="Duty Schedule: 5 days (Sun - Thu)" className="px-2 text-sm md:text-md">Duty Schedule: 5 days (Sun - Thu)</label>
              <input type="checkbox" id="Festival Bonus: 2" name="benefits" value="Festival Bonus: 2" />
              <label htmlFor="Festival Bonus: 2" className="px-2 text-sm md:text-md">Festival Bonus: 2 (Eid)</label>
              <input type="checkbox" id="Professional development opportunities" name="benefits" value="Professional development opportunities" />
              <label htmlFor="Professional development opportunities" className="px-2 text-sm md:text-md">Professional development opportunities</label>
              <input type="checkbox" id="Snacks, Tea & Coffee" name="benefits" value="Snacks, Tea & Coffee" />
              <label htmlFor="Snacks, Tea & Coffee" className="px-2 text-sm md:text-md">Snacks, Tea & Coffee</label>
              <input type="checkbox" id="Health insurance" name="benefits" value="Health insurance" />
              <label htmlFor="Health insurance" className="px-2 text-sm md:text-md">Health insurance</label>
              <input type="checkbox" id="Salary Review: Half Yearly" name="benefits" value="Salary Review: Half Yearly" />
              <label htmlFor="Salary Review: Half Yearly" className="px-2 text-sm md:text-md">Salary Review: Half Yearly</label>
              <input type="checkbox" id="Others" name="benefits" value="Others" />
              <label htmlFor="Others" className="px-2 text-sm md:text-md">Others</label>
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm">Deadline</label>
              <input
                className="block w-full p-2 border text-sm md:text-md rounded-md text-gray-800 border-gray-400 focus: outline-none mt-1 focus:ring-1 focus:ring-cyan-700"
                type="date"
                name="deadline"
                id="deadline"
                required
              />
            </div>
            <div>
              <label
                htmlFor="salary"
                className="block text-sm text-gray-700"
              >
                Salary <span className="text-gray-700">(optional)</span>
              </label>
              <input
                className="block mt-1 w-full border text-sm md:text-md border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                type="text"
                name="salary"
                id="salary"
                placeholder="e.g., $30,000 - $45,000"
              />
            </div>
            <div>
              <p className="my-2 text-sm">Job Location</p>
              <input type="radio" id="Work at office" name="jobplace" value="Work at office" defaultChecked />
              <label htmlFor="Work at office" className="px-2 text-sm md:text-md">Work at office</label>
              <input type="radio" id="Work from home" name="jobplace" value="Work from home" />
              <label htmlFor="Work from home" className="px-2 text-sm md:text-md">Work from home</label>
              <input type="radio" id="Office/Home" name="jobplace" value="Office/Home" />
              <label htmlFor="Office/Home" className="px-2 text-sm md:text-md">Office / Home</label>
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm text-gray-700"
              >
                Company Address
              </label>
              <input
                className="block mt-1 w-full border text-sm md:text-md border-gray-400 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                type="text"
                name="location"
                id="location"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="outline-0 bg-orange-400 text-sm md:text-md px-2 py-1 md:px-3 md:py-2 cursor-pointer rounded-full hover:bg-orange-500 disabled:cursor-not-allowed mt-4 font-semibold"
              >
                Create your post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    )}
  }
  
};

export default PostYourJob;
