import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8">
        <Image
          src="/logo-color.svg"
          alt="ClientPro"
          width={140}
          height={32}
        />
      </Link>
      <h1 className="text-6xl font-bold text-dark mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-2">Page not found</p>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Back to Home
        </Link>
        <Link
          href="/contact"
          className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-200"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
