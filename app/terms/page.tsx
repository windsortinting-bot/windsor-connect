"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10 pb-20">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">
          Windsor Connect · Last updated: August 2026
        </p>

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">1. Eligibility</h2>
            <p>
              You must be at least 18 years old to use Windsor Connect. By
              creating an account, you confirm you are 18 or older and that the
              information you provide is accurate.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">2. Your account</h2>
            <p>
              You are responsible for keeping your login secure and for all
              activity under your account. Do not share your password. We may
              suspend or remove accounts that violate these terms or harm other
              users.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">3. Community rules</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Harass, threaten, or scam other users</li>
              <li>Post illegal, explicit without consent, or hateful content</li>
              <li>Use fake photos or impersonate someone else</li>
              <li>Spam, advertise, or solicit commercially without permission</li>
              <li>Attempt to scrape, hack, or abuse the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">4. Safety</h2>
            <p>
              Windsor Connect helps people meet, but we cannot guarantee the
              identity or intentions of every user. Meet in public places, tell
              a friend, and use in-app Block and Report tools. Never send money
              to someone you met online.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">5. Content</h2>
            <p>
              You keep ownership of content you upload. You grant us a limited
              license to host and display that content so the app can function
              (for example, showing your photos to other users in Windsor).
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">6. Termination</h2>
            <p>
              You may delete your account at any time in Settings. We may
              remove accounts that break these terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">7. Disclaimer</h2>
            <p>
              The service is provided “as is.” We do not guarantee uninterrupted
              access, matches, or outcomes. To the fullest extent allowed by law,
              Windsor Connect is not liable for interactions between users
              online or offline.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">8. Contact</h2>
            <p>
              Questions about these terms: use the Help page in the app or
              contact the project operator for Windsor Connect.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}