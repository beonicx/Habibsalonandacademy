"use client";

export default function SiteError({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We could not load this page. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="border border-amber-700 text-amber-700 px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
