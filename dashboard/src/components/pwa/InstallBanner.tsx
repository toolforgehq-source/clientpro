"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Share, Plus, MoreVertical, Smartphone } from "lucide-react";

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

const DISMISSED_KEY = "clientpro_install_dismissed";
const DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISSED_DURATION) return;

    const detectedPlatform = getPlatform();
    setPlatform(detectedPlatform);

    // Show banner after a short delay so it doesn't feel intrusive
    const timer = setTimeout(() => setVisible(true), 3000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for the beforeinstallprompt event (Chrome/Android)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      // Android/Chrome: trigger native install prompt
      const prompt = deferredPrompt as Event & { prompt: () => Promise<void> };
      await prompt.prompt();
      setDeferredPrompt(null);
      setVisible(false);
    } else {
      // iOS/other: show manual instructions
      setShowInstructions(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setVisible(false);
    setShowInstructions(false);
  }, []);

  if (!visible) return null;

  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={handleDismiss} />
        <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl bg-white p-6 shadow-2xl">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Install ClientPro</h3>
              <p className="text-sm text-gray-500">Add to your home screen</p>
            </div>
          </div>

          {platform === "ios" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Follow these 3 easy steps:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tap the Share button
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      The <Share className="inline h-3.5 w-3.5 mb-0.5" /> icon at the bottom of Safari
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Scroll down and tap &quot;Add to Home Screen&quot;
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Look for the <Plus className="inline h-3.5 w-3.5 mb-0.5" /> icon
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tap &quot;Add&quot;
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ClientPro will appear on your home screen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : platform === "android" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Follow these 3 easy steps:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tap the menu button
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      The <MoreVertical className="inline h-3.5 w-3.5 mb-0.5" /> icon in Chrome&apos;s top right
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tap &quot;Add to Home screen&quot;
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Or &quot;Install app&quot; if you see it
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tap &quot;Add&quot;
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ClientPro will appear on your home screen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Install ClientPro for quick access from your desktop:
              </p>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                <Download className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Look for the install icon in your browser&apos;s address bar
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    In Chrome, click the <Download className="inline h-3.5 w-3.5 mb-0.5" /> icon on the right side of the URL bar
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600"
          >
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  // Compact banner
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg transition-all duration-300">
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Get the ClientPro app</p>
            <p className="text-xs text-gray-500">
              {platform === "ios"
                ? "Add to your iPhone home screen"
                : platform === "android"
                ? "Install on your phone"
                : "Install for quick access"}
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <Smartphone className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
