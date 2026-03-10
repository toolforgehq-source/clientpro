"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        "https://clientpro-api.onrender.com/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "";
      setError(
        message.includes("fetch") || message.includes("network") || !message
          ? "Unable to send your message right now. Please try again or email us at support@clientpro.io."
          : message
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image
            src="/logo-color.svg"
            alt="ClientPro"
            width={130}
            height={30}
          />
        </Link>

        <h1 className="text-3xl font-bold text-dark mb-2">Contact Us</h1>
        <p className="text-slate-500 mb-10">
          Have a question, need help, or want to learn more about ClientPro?
          Send us a message and we&apos;ll get back to you within 24 hours.
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-dark mb-2">
              Message sent!
            </h2>
            <p className="text-slate-600 mb-6">
              Thanks for reaching out! We&apos;ll get back to you within 24
              hours at the email you provided.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", message: "" });
              }}
              className="text-primary hover:underline text-sm"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-dark mb-1.5"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-dark mb-1.5"
              >
                How can we help?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your question or issue..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-y"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm mb-4">
            You can also reach us directly:
          </p>
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <a
              href="mailto:support@clientpro.io"
              className="text-primary hover:underline flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              support@clientpro.io
            </a>
          </div>
        </div>

        <div className="mt-8 flex gap-6 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Back to Home
          </Link>
          <Link href="/legal/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
