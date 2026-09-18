import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-amber-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/services"
            className="border border-amber-700 text-amber-700 px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors"
          >
            View Services
          </Link>
        </div>
      </div>
    </div>
  );
}
