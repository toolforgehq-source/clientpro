"use client";

import { useState, useEffect, useCallback } from "react";
import { Share, Plus, MoreVertical, Download, Smartphone, Check } from "lucide-react";

type Platform = "ios" | "android" | "desktop" | "unknown";

function getPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/.test(ua) && !/Mobile/.test(ua)) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function InstallInstructions() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    setPlatform(getPlatform());
    setInstalled(isStandalone());
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      const prompt = deferredPrompt as Event & { prompt: () => Promise<void> };
      await prompt.prompt();
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (installed) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-green-800">App Installed</h2>
            <p className="text-sm text-green-600">
              You&apos;re using ClientPro as an installed app. Enjoy the full experience!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Install ClientPro App</h2>
          <p className="text-sm text-gray-500">
            Add ClientPro to your home screen for quick access — works like a real app
          </p>
        </div>
      </div>

      {deferredPrompt ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Click the button below to install ClientPro on your device:
          </p>
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            Install ClientPro
          </button>
        </div>
      ) : platform === "ios" ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            To install on your iPhone or iPad:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                1
              </div>
              <p className="text-sm text-gray-700">
                Tap the <Share className="inline h-4 w-4 mb-0.5 text-primary" /> Share button at the bottom of Safari
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                2
              </div>
              <p className="text-sm text-gray-700">
                Scroll down and tap <Plus className="inline h-4 w-4 mb-0.5 text-primary" /> <strong>&quot;Add to Home Screen&quot;</strong>
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                3
              </div>
              <p className="text-sm text-gray-700">
                Tap <strong>&quot;Add&quot;</strong> — ClientPro will appear on your home screen
              </p>
            </div>
          </div>
        </div>
      ) : platform === "android" ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            To install on your Android phone:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                1
              </div>
              <p className="text-sm text-gray-700">
                Tap the <MoreVertical className="inline h-4 w-4 mb-0.5 text-primary" /> menu button in Chrome
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                2
              </div>
              <p className="text-sm text-gray-700">
                Tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                3
              </div>
              <p className="text-sm text-gray-700">
                Tap <strong>&quot;Add&quot;</strong> — ClientPro will appear on your home screen
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            To install on your computer:
          </p>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
            <Download className="h-5 w-5 mt-0.5 text-primary shrink-0" />
            <p className="text-sm text-gray-700">
              In Chrome, look for the <Download className="inline h-4 w-4 mb-0.5 text-primary" /> install icon on the right side of the address bar and click it
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
