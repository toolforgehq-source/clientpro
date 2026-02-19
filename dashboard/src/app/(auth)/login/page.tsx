"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-primary to-primary-700 p-12 lg:flex">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <span className="text-2xl font-bold text-white">ClientPro</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white">Welcome back</h1>
        <p className="mt-3 text-lg text-primary-200">
          Log in to manage your past clients and automated follow-up messages.
        </p>
      </div>
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-bold text-dark">ClientPro</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-gray-500">Log in to manage your past clients</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
