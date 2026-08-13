import React from "react";
import { Heart, MapPin, Coffee, Sparkles, Beer, Utensils } from "lucide-react";

export default function WindsorConnectLanding() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
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

      {/* Hero Section */}
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

        {/* Quick Email Signup / Waitlist Form */}
        <div className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Enter your email for early access..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white placeholder-slate-500 px-4 py-3 rounded-xl outline-none transition-all text-sm"
          />
          <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover