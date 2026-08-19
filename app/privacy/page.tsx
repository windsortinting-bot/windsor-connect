"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">
          Windsor Connect · Last updated: August 2026
        </p>

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">1. What we collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Account info: email, password (handled by Supabase Auth)</li>
              <li>Profile info: name, age, photos, bio, preferences, neighborhood</li>
              <li>App activity: swipes, matches, messages, reports, blocks</li>
              <li>Technical data: basic device/browser info needed to run the site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">2. How we use it</h2>
            <p>
              We use your data to operate Windsor Connect: show profiles, create
              matches, deliver messages, improve safety (block/report), and
              enforce daily limits. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">3. Who can see your profile</h2>
            <p>
              Other users in the community may see profile details you choose to
              publish (photos, bio, prompts, etc.). Messages are visible to the
              people in that conversation and may be reviewed if reported for
              safety.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">4. Service providers</h2>
            <p>
              We use infrastructure providers such as Supabase (database/auth)
              and Vercel (hosting). They process data only to provide their
              services under their own policies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">5. Retention & deletion</h2>
            <p>
              You can delete your account in Settings. When you delete, we remove
              or anonymize profile data associated with your account, subject to
              limited records we may keep for safety, fraud prevention, or legal
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">6. Your choices</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Edit or remove profile content anytime</li>
              <li>Pause your profile to hide from discovery</li>
              <li>Block or report other users</li>
              <li>Delete your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">7. Contact</h2>
            <p>
              Privacy questions: use Help in the app or contact the Windsor
              Connect operator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}