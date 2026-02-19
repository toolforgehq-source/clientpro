"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("new_password", "");

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (score === 3) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  };

  const strength = getPasswordStrength(password);

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Invalid Reset Link</h2>
        <p className="mt-2 text-sm text-gray-500">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="mt-4">Request New Link</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await api.auth.resetPassword({
      token,
      new_password: data.new_password,
    });
    setLoading(false);
    if (error) {
      if (error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid")) {
        toast("error", "This reset link has expired. Request a new one.");
      } else {
        toast("error", error);
      }
    } else {
      toast("success", "Password updated successfully");
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          id="new_password"
          label="New password"
          type="password"
          placeholder="Min 8 characters"
          error={errors.new_password?.message}
          {...register("new_password")}
        />
        {password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${i <= strength.level ? strength.color : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{strength.label}</p>
          </div>
        )}
      </div>
      <Input
        id="confirm_password"
        label="Confirm password"
        type="password"
        placeholder="Repeat your password"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-bold text-dark">ClientPro</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
            <p className="mt-1 text-gray-500">Enter your new password below</p>
          </div>
          <Suspense fallback={<div className="py-8 text-center text-gray-500">Loading...</div>}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
