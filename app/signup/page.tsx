import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo-color.svg"
              alt="ClientPro"
              width={140}
              height={32}
              className="mx-auto mb-6"
            />
          </Link>
          <h1 className="text-2xl font-bold text-dark mb-2">Get started</h1>
          <p className="text-slate-500">
            Create your ClientPro account in 2 minutes
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Jane Smith"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a strong password"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            Create Account
          </button>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
