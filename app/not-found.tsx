import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-slate-400 text-sm mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
      >
        Go home
      </Link>
    </div>
  );
}