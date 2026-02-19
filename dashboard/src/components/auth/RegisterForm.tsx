"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPhone, toE164 } from "@/lib/utils";

const schema = z
  .object({
    first_name: z.string().min(1, "First name required"),
    last_name: z.string().min(1, "Last name required"),
    email: z.string().email("Valid email required"),
    phone_number: z.string().min(1, "Phone number required"),
    company_name: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

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

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const error = await registerUser({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: toE164(data.phone_number),
      company_name: data.company_name || undefined,
    });
    setLoading(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Welcome to ClientPro! Add your first client to get started.");
      router.push("/");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("phone_number", formatted, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="first_name"
          label="First name"
          placeholder="John"
          error={errors.first_name?.message}
          {...register("first_name")}
        />
        <Input
          id="last_name"
          label="Last name"
          placeholder="Smith"
          error={errors.last_name?.message}
          {...register("last_name")}
        />
      </div>
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="phone_number"
        label="Phone number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        error={errors.phone_number?.message}
        {...register("phone_number", { onChange: handlePhoneChange })}
      />
      <Input
        id="company_name"
        label="Company name (optional)"
        placeholder="RE/MAX Premier"
        {...register("company_name")}
      />
      <div>
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          error={errors.password?.message}
          {...register("password")}
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
        Create Account
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-600">
          Log in
        </Link>
      </p>
    </form>
  );
}
