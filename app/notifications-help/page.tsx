"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificationsHelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <Bell className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-slate-500 text-sm mb-8">
          How alerts work during soft launch
        </p>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">In-app badges</p>
            <p className="text-slate-500">
              Likes, matches, and unread chats show on the bottom navigation.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Email</p>
            <p className="text-slate-500">
              Account confirmation and password reset still use email.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Push notifications</p>
            <p className="text-slate-500">
              Native push is not required for soft launch. You can add it later
              with a service worker + permission prompt.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/settings")}
          className="mt-8 w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
        >
          Open settings
        </button>
      </div>
    </div>
  );
}