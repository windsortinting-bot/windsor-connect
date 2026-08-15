"use client";

import React from "react";
import { Heart, MapPin, Coffee, Sparkles, Beer, Utensils } from "lucide-react";

export default function WindsorConnectLanding() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-rose-500 to-pink-500 p-2 rounded-xl text-white shadow-lg shadow-rose-500/20">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Windsor<span className="text-rose-500">Connect</span>
          </span>
        </div>
        <button className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-all shadow-md shadow-rose-500/20">
          Get Started
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Exclusively for the 519
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Real connections across <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
            Walkerville, Riverside & Beyond.
          </span>
        </h1>

        <p className="mt-6 text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
          The first city-focused dating app built specifically for Windsor singles. Skip scattered matches and connect with locals in your neighborhood.
        </p>

        <div className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Enter your email for early access..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white placeholder-slate-500 px-4 py-3 rounded-xl outline-none transition-all text-sm"
          />
          <button
  onClick={() => (window.location.href = "/auth")}
  className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-all shadow-md shadow-rose-500/20"
>
  Get Started
</button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">Popular hubs:</span>
          {["Walkerville", "Ford City", "Downtown", "Riverside", "South Windsor", "UWindsor"].map((hood) => (
            <span key={hood} className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              {hood}
            </span>
          ))}
        </div>

        <div className="mt-20 w-full text-left">
          <div className="border-t border-slate-800/80 pt-12 mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">First Date Perks in Windsor</h2>
            <p className="text-slate-400 text-sm mt-1">
              Match on Windsor Connect and enjoy exclusive local perks on your first meetup.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Anchor Coffee House</h3>
              <p className="text-xs text-rose-400 font-medium mt-0.5">Walkerville</p>
              <p className="text-xs text-slate-400 mt-2">2-for-1 drip coffees or 15% off your first coffee date order.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Beer className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Craft Heads Brewing</h3>
              <p className="text-xs text-rose-400 font-medium mt-0.5">Downtown</p>
              <p className="text-xs text-slate-400 mt-2">Free pretzel appetizer when you both order a pint on your match date.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Vito’s Pizzeria</h3>
              <p className="text-xs text-rose-400 font-medium mt-0.5">Via Italia</p>
              <p className="text-xs text-slate-400 mt-2">Complimentary dessert to share at the end of your first dinner date.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Windsor Connect. Built for Windsor, ON.
      </footer>
    </div>
  );
}