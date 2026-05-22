import React from "react";
import { BookOpen, GraduationCap, Award, Zap, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, Play } from "lucide-react";

interface LandingPageProps {
  onEnterApp: (mode: "login" | "guest") => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="landing-page-root">
      {/* Odisha Subtle Cultural Branding Header bar */}
      <div className="bg-[#1e3a8a] text-white py-1 px-4 text-xs text-center border-b border-blue-850 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        <span>Jai Jagannath! Best digital learning hub customizer for youth across Odisha standard.</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100 flex items-center justify-between px-6 py-4" id="landing-header">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6 stroke-2" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-blue-900 block leading-none">ODISHA EXAM</span>
            <span className="text-[10px] uppercase font-semibold text-amber-600 tracking-wider">Education For Progress</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#exams" className="hover:text-blue-900 transition-colors">Target Exams</a>
          <a href="#features" className="hover:text-blue-900 transition-colors">Core Features</a>
          <a href="#monetization" className="hover:text-blue-900 transition-colors">Premium Plans</a>
          <a href="#statistics" className="hover:text-blue-900 transition-colors">Ranks & Insights</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            id="btn-guest-mode"
            onClick={() => onEnterApp("guest")}
            className="hidden sm:inline-block px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Practice as Guest
          </button>
          <button
            id="btn-login-trigger"
            onClick={() => onEnterApp("login")}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 shadow-md shadow-orange-500/10 transition-colors cursor-pointer"
          >
            Login / Signup
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-12 md:py-20 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-8 items-center" id="hero-section">
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-indigo-50 border border-indigo-100/80 text-blue-800 text-xs font-semibold mb-6 w-fit">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>#1 Academic and Job Recruitment Prep App in Odisha</span>
          </div>

          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl text-blue-950 tracking-tight leading-tight mb-6">
            Crack Your Dream Odisha Exam <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-orange-500">
              with Expert Pedagogy & AI Mentoring
            </span>
          </h1>

          <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed max-w-2xl">
            Empowering OSSSC, OSSC, OPSC preps and PSE/CHSE board scholars across 30 state districts. Take timed bilingual tests, track live ranks, download GK booklets, and access AI-driven doubt solving, completely tailored with secure anti-cheating systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              id="hero-free-test-btn"
              onClick={() => onEnterApp("guest")}
              className="px-8 py-4 bg-blue-900 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-950 hover:shadow-blue-900/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              Start Free Practice
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onEnterApp("login")}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-base rounded-2xl hover:bg-slate-50 transition-colors text-center flex items-center justify-center gap-2"
            >
              <UserCheck className="h-5 w-5 text-orange-500" />
              Sign In with OTP / Google
            </button>
          </div>

          {/* Core Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200 text-slate-500">
            <div>
              <span className="block text-2xl font-bold text-blue-900 leading-none">1.5 Lac+</span>
              <span className="text-xs text-slate-500">Registered Students</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-blue-900 leading-none">1,200+</span>
              <span className="text-xs text-slate-500">Free Practice MCQs</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-blue-900 leading-none">98.2%</span>
              <span className="text-xs text-slate-500">Satisfaction Rate</span>
            </div>
          </div>
        </div>

        {/* Hero Illustrative Sidebar Card */}
        <div className="md:col-span-5 relative" id="hero-illustration">
          <div className="absolute inset-0 bg-blue-100 rounded-3xl blur-xl opacity-40 -rotate-3 scale-95"></div>
          <div className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
            {/* Live Mock Banner */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">LIVE MOCK BATTLE</span>
              </div>
              <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-md border border-amber-100">
                District Level
              </span>
            </div>

            {/* Simulated Live Matchup */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">PB</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Prativa Bhol (OSSSC RI Aspirant)</h4>
                    <span className="text-[10px] text-slate-500">District: Mayurbhanj</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-900">Score: 94/100</span>
              </div>

              <div className="p-3 bg-orange-50/50 outline-dotted outline-1 outline-orange-300 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">PK</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Pradyumna Kar (Constable Aspirant)</h4>
                    <span className="text-[10px] text-slate-500">District: Ganjam</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-700">Score: 92/100</span>
              </div>
            </div>

            {/* Quick Live Stats badge list */}
            <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <span className="block text-xs font-bold text-slate-600 mb-1">Statewide Coverage</span>
              <p className="text-[11px] text-slate-500 leading-normal mb-3">
                Students from Khordha, Cuttack, Puri, Sambalpur, Bolangir, and Balasore are practicing together live!
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full bg-slate-300 border border-white text-[8px] font-black flex items-center justify-center">K</div>
                  <div className="h-5 w-5 rounded-full bg-blue-300 border border-white text-[8px] font-black flex items-center justify-center font-mono">C</div>
                  <div className="h-5 w-5 rounded-full bg-amber-300 border border-white text-[8px] font-black flex items-center justify-center font-mono">S</div>
                </div>
                <span className="text-[10px] text-blue-950 font-semibold">+980 active from Sambalpur region</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Exams Covered Section (Bento Grid) */}
      <section className="bg-white py-16 px-6 border-y border-slate-150" id="exams">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-4 tracking-tight">Structured Exam Syllabuses We Cover</h2>
            <p className="text-slate-600 text-sm md:text-base">
              Odisha Exams features meticulously curated subject blocks, free previous year papers (PYQs), and multi-level simulation tests under real guidelines with negative marking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Category 1 Card: Competitive Recruitment */}
            <div className="border border-slate-100 rounded-3xl p-8 bg-slate-50/80 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/10">
                  <Award className="h-6 w-6 stroke-2" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950">1. Competitive Govt Exams</h3>
                  <p className="text-xs text-slate-500">Comprehensive job prep catalog</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="block font-bold text-sm text-blue-900">OSSSC Exams</span>
                  <span className="text-[11px] text-slate-500">RI, AMIN, Forest Guard, PEO</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="block font-bold text-sm text-blue-900">OSSC Exams</span>
                  <span className="text-[11px] text-slate-500">CGL, Junior Assistant, Block Officer</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="block font-bold text-sm text-blue-900">OPSC Services</span>
                  <span className="text-[11px] text-slate-500">Civil Services (Pre + Mains Mock)</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="block font-bold text-sm text-blue-900">Police SI & Const</span>
                  <span className="text-[11px] text-slate-500">SI Cadet, Comm Constable, Jail Guard</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors col-span-2">
                  <span className="block font-bold text-sm text-blue-900">OTET, OSSTET & B.Ed Exams</span>
                  <span className="text-[11px] text-slate-500">Odisha Teachers Eligibility Test (Pedagogy, Compulsory Odia)</span>
                </div>
              </div>
              <button
                onClick={() => onEnterApp("guest")}
                className="mt-auto px-5 py-3 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition-colors text-center inline-flex items-center justify-center gap-1.5"
              >
                Access Competitive Zone
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Category 2 Card: Academic Standards */}
            <div className="border border-slate-100 rounded-3xl p-8 bg-slate-50/80 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <BookOpen className="h-6 w-6 stroke-2" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950">2. Academic Board Exams</h3>
                  <p className="text-xs text-slate-500">Class 9, 10, 11 & 12 under BSE/CHSE</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors col-span-2">
                  <span className="block font-bold text-sm text-amber-700">BSE Class 10 Board Test Pack</span>
                  <span className="text-[11px] text-slate-500">Bilingual Practice sets for Science, Maths, Sahitya (Odia), English</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="block font-bold text-sm text-blue-900">CHSE Class 12 Science</span>
                  <span className="text-[11px] text-slate-500">Physics, Chem, Math, Bio</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="block font-bold text-sm text-blue-900">CHSE Class 12 Arts</span>
                  <span className="text-[11px] text-slate-500">History, Political, Eco</span>
                </div>
                <div className="p-3 bg-white border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors col-span-2">
                  <span className="block font-bold text-sm text-blue-900">Commerce Stream Packs</span>
                  <span className="text-[11px] text-slate-500">Accountancy, Business Studies for CHSE Odisha board paper</span>
                </div>
              </div>
              <button
                onClick={() => onEnterApp("guest")}
                className="mt-auto px-5 py-3 bg-slate-850 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors text-center inline-flex items-center justify-center gap-1.5"
              >
                Access Boards Class Pack
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core App Mechanics Features Showcase */}
      <section className="bg-slate-50 py-16 px-6" id="features">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-3 tracking-tight">The ultimate tools for Odisha topper selection</h2>
            <p className="text-slate-600 text-sm">
              We provide features that parallel standard commercial sites like Testbook or Adda247 with localized language and culture components.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 font-bold text-xs font-mono">BILINGUAL</div>
              <h4 className="font-bold text-sm text-blue-950 mb-2">Bilingual Interface</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Easily toggle individual questions and explanations between **English** and full **Odia script**.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold text-xs font-mono">AI-MENTOR</div>
              <h4 className="font-bold text-sm text-blue-950 mb-2">Prerana AI doubts</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Ask doubts instantly inside chapters and receive custom revision schedules based on weak areas.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 font-bold text-xs font-mono">RANKS</div>
              <h4 className="font-bold text-sm text-blue-950 mb-2">District Leaderboards</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Compete for top scores and earn statewide recognition by district filters across Odisha.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 font-bold text-xs font-mono">CERTIFICATE</div>
              <h4 className="font-bold text-sm text-blue-950 mb-2">Verified Certificates</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Complete grand tests and generate credentials in clean formats sharing on social timelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing / Monetization Page Module (Mock Billing) */}
      <section className="bg-white py-16 px-6" id="monetization">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-3 tracking-tight">Kalinga Prime Premium Plans</h2>
            <p className="text-slate-600 text-sm">
              Invest in your preparation with packages designed specifically for low internet bandwidth and highest reward return.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan 1: Free */}
            <div className="border border-slate-100 rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 w-fit px-3 py-1 rounded-full mb-4">
                Basic Practice
              </span>
              <h3 className="text-lg font-bold text-slate-800">Mahanadi Free Plan</h3>
              <p className="text-xs text-slate-500 mb-6">Explore the syllabus fundamentals</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-950">₹0</span>
                <span className="text-xs text-slate-500">/ forever free</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-slate-600 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>2 Daily Practice Quizzes</span>
                </li>
                <li className="flex items-center gap-2 opacity-60">
                  <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0" />
                  <span>Bilingual Support (Limited)</span>
                </li>
                <li className="flex items-center gap-2 opacity-60">
                  <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0" />
                  <span>AI Doubt Solver (1 Query/day)</span>
                </li>
              </ul>
              <button
                onClick={() => onEnterApp("guest")}
                className="mt-auto w-full py-2.5 outline-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Launch Guest Practice
              </button>
            </div>

            {/* Plan 2: Kalinga Prime */}
            <div className="border-2 border-orange-400 rounded-3xl p-6 flex flex-col hover:shadow-lg relative bg-amber-50/10">
              <span className="absolute top-0 right-0 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] uppercase font-black px-4 py-1 rounded-full shadow-md">
                MOST POPULAR
              </span>
              <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 w-fit px-3 py-1 rounded-full mb-4">
                Full Aspirant Pass
              </span>
              <h3 className="text-lg font-bold text-blue-950">Kalinga Prime Subscriptions</h3>
              <p className="text-xs text-slate-500 mb-6">Designed for guaranteed state selectors</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-950">₹149</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-slate-600 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>Unlimited OSSSC, OSSC, and OPSC Exam Mocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>Interactive Live Mock Battles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>Unlimited Gemini AI Doubt solving & revision schedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>Verified PDF Download with Offline Mode toggle</span>
                </li>
              </ul>
              <button
                onClick={() => onEnterApp("login")}
                className="mt-auto w-full py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:bg-orange-600 animate-pulse transition-all cursor-pointer"
              >
                Access Kalinga Prime Plan
              </button>
            </div>

            {/* Plan 3: CHSE/BSE Academic Pass */}
            <div className="border border-slate-100 rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all">
              <span className="text-[10px] uppercase font-bold text-[#1e3a8a] bg-blue-100 w-fit px-3 py-1 rounded-full mb-4">
                Boards Super Pack
              </span>
              <h3 className="text-lg font-bold text-[#1e3a8a]">BSE & CHSE Boards Bundle</h3>
              <p className="text-xs text-slate-500 mb-6">Custom 9th, 10th & 12th test series</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-950">₹99</span>
                <span className="text-xs text-slate-500">/ per board term</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-slate-600 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] shrink-0" />
                  <span>Full Science, Arts, Commerce model sets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] shrink-0" />
                  <span>School Chapterwise Mock palette selection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] shrink-0" />
                  <span>Parent Scorecard Dashboard access</span>
                </li>
              </ul>
              <button
                onClick={() => onEnterApp("login")}
                className="mt-auto w-full py-2.5 bg-slate-850 opacity-90 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                Claim Board Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* State Authority Footer */}
      <footer className="bg-blue-950 text-slate-300 py-12 px-6 mt-auto text-center border-t border-blue-900" id="landing-footer">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-4 gap-8 text-left mb-8">
          <div className="md:col-span-2">
            <span className="font-black text-xl text-white tracking-widest block mb-4">ODISHA EXAM</span>
            <p className="text-xs text-slate-400 leading-normal max-w-sm">
              Odisha Exams state platform acts as a digital helper built natively for Odisha students targeting local bodies recruitment OSSSC, OSSC, OPSC civil programs, police services, and BSE/CHSE syllabus boards.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Quick Channels</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#exams" className="hover:text-amber-500">Government Jobs Alerts</a></li>
              <li><a href="#features" className="hover:text-amber-500">Odia Test Interface</a></li>
              <li><a href="#monetization" className="hover:text-amber-500">Mock Quiz Calendar</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Help desk Support</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Email: support@odishaexam.gov.in <br />
              WhatsApp Help: +91 94370-XXXXX <br />
              Bhubaneswar Office, near Acharya Vihar Co-working Hub.
            </p>
          </div>
        </div>
        <div className="border-t border-blue-900 pt-6 text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Odisha Exam Inc. All Rights Reserved. Not affiliated officially with OSSSC/BSE Odisha Boards. Proudly made-for-Odisha.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
