"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Error</h1>
        <p className="text-gray-600 mb-8">
          Something went wrong in the admin panel. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/admin"
            className="border border-amber-700 text-amber-700 px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Admin Home
          </a>
        </div>
      </div>
    </div>
  );
}
