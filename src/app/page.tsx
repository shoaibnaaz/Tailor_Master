import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-4">
      <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-center">
        ✂️ Tailor Master
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-indigo-100 text-center max-w-xl">
        Manage your tailoring business — customers, measurements, and orders all
        in one place.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow hover:bg-indigo-50 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
