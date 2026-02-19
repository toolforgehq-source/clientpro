"use client";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
        <h1 className="text-4xl font-bold text-white">Get started</h1>
        <p className="mt-3 text-lg text-primary-200">
          Create your account and start automating client follow-up in minutes.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 text-primary-100">
            <div className="h-6 w-6 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold text-white">1</div>
            <span>4 personalized texts per client per year</span>
          </div>
          <div className="flex items-center gap-3 text-primary-100">
            <div className="h-6 w-6 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold text-white">2</div>
            <span>Messages sent from your dedicated number</span>
          </div>
          <div className="flex items-center gap-3 text-primary-100">
            <div className="h-6 w-6 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold text-white">3</div>
            <span>Edit every message before it sends</span>
          </div>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-1 text-gray-500">Start automating client follow-up</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
