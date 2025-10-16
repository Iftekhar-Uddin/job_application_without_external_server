
const loading = () => {

  return (
    <div className="">
      <div className="max-w-7xl mx-auto p-4 bg-amber-100 rounded-md">
        <h1 className="text-lg md:text-2xl font-semibold text-orange-500">Find your Job</h1>
        <div className="w-full mt-2">
          <form className="grid gap-4 grid-cols-3">
            <input
              type="text"
              name="query"
              placeholder="Search jobs... (e.g., software)"
              className="border border-gray-500 text-xs md:text-base rounded-xs md:rounded-sm py-1 px-2 focus:outline-none md:focus:ring-1"
            />
            <select
              name="type"
              className="border border-gray-500 text-xs md:text-base rounded-xs md:rounded-sm py-1 px-2 focus:outline-none md:focus:ring-1"
            >
              <option value="">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Part time">Part time</option>
              <option value="Full time">Full time</option>
              <option value="Contractual">Contractual</option>
            </select>
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="border border-gray-500 text-xs md:text-base rounded-xs md:rounded-sm py-1 px-2 focus:outline-none md:focus:ring-1"
            />
            <button
              type="submit"
              className="col-span-3 py-0.5 md:py-1 rounded-md bg-orange-400 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto bg-amber-100 md:mt-4 mt-2 rounded-lg h-fit p-2 md:p-4">
        <h1 className="text-lg md:text-3xl text-center text-orange-400 md:mb-4 underline">
          Available Jobs
        </h1>

        {/* Skeleton Loader */}
        <div className="grid gap-y-4 md:grid-cols-1 md:gap-6 lg:grid-cols-2 xl:grid-cols-3 items-start justify-items-center-safe py-4 overflow-y-scroll">
          {[...Array(9)].map((_, idx) => (
            <div
              key={idx}
              className="w-72 md:w-[380px] h-[150px] bg-amber-100 animate-pulse rounded-sm md:rounded-lg p-4 flex flex-col gap-2 ring-1 ring-amber-300"
            >
              <div className="w-3/4 h-5 bg-amber-200 rounded"></div>
              <div className="w-1/2 h-4 bg-amber-200 rounded"></div>
              <div className="flex justify-between mt-4">
                <div className="flex flex-col gap-2">
                  <div className="w-20 h-3 bg-amber-200 rounded"></div>
                  <div className="w-28 h-3 bg-amber-200 rounded"></div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="w-24 h-3 bg-amber-200 rounded"></div>
                  <div className="w-28 h-3 bg-amber-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default loading;