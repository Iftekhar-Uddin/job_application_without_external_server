export default function UnauthorizedPage() {
  return (
    <div className="max-w-7xl mx-auto rounded-md flex h-[calc(100vh-36rem)] bg-white/70">
      <div className="flex flex-col justify-center items-center w-full ">
        <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 mt-2">
          You don’t have permission to view this page.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
