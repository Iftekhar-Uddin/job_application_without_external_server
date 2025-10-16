const loading = () => {
    return (
        <div className="bg-amber-100 max-w-7xl mx-auto h-fit rounded-lg animate-pulse">
            <div className="p-6 grid grid-rows-1 gap-y-12 w-full">
                {/* Header: Back link and Deadline */}
                <div className="flex justify-between items-center">
                    <div className="w-24 h-4 bg-amber-200 rounded" />
                    <div className="w-40 h-4 bg-amber-200 rounded" />
                </div>

                {/* Title, Company, Details */}
                <div className="flex w-full">
                    <div className="flex flex-col space-y-2 w-full">
                        <div className="w-1/5 h-5 bg-amber-200 rounded" />
                        <div className="w-1/7 h-4 bg-amber-200 rounded" />
                        <div className="md:flex justify-between pt-4 w-8/9">
                            {/* Left Side */}
                            <div className="space-y-2 w-full md:w-1/2">
                                <div className="w-1/6 h-5 bg-amber-200 rounded" />
                                <div className="w-3/7 h-5 bg-amber-200 rounded" />
                                <div className="w-1/3 h-5 bg-amber-200 rounded" />
                            </div>

                            {/* Right Side */}
                            <div className="space-y-2 w-full md:w-1/2 mt-2 md:mt-0">
                                <div className="w-3/5 h-5 bg-amber-200 rounded" />
                                <div className="w-1/3 h-4 bg-amber-200 rounded" />
                                <div className="w-3/5 h-12 bg-amber-200 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-3">
                    <div className="w-40 h-5 bg-amber-200 rounded" />
                    <div className="h-3 bg-amber-200 rounded" />
                    <div className="h-3 bg-amber-200 rounded" />
                    <div className="h-3 bg-amber-200 rounded" />
                    <div className="h-3 bg-amber-200 rounded" />
                </div>

                {/* Workplace */}
                <div className="w-1/5 h-5 bg-amber-200 rounded" />

                {/* Benefits */}
                <div>
                    <div className="w-40 h-5 bg-amber-200 rounded mb-2" />
                    <ul className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <li key={i} className="w-1/4 h-4 bg-amber-200 rounded ml-4" />
                        ))}
                    </ul>
                </div>

                {/* Footer Info */}
                <div className="md:flex justify-between items-center space-y-2 md:space-y-0">
                    <div className="w-1/6 h-4 bg-amber-200 rounded" />
                    <div className="w-1/6 h-4 bg-amber-200 rounded" />
                    <div className="w-1/6 h-4 bg-amber-200 rounded" />
                </div>

                {/* Apply Button */}
                <div className="flex justify-end">
                    <div className="w-20 h-8 bg-amber-200 rounded-full" />
                </div>
            </div>
        </div>
    );

}

export default loading;