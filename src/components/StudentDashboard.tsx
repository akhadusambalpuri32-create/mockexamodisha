import React, { useState } from "react";
import { UserProfile, Exam } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, BookOpen, Clock, Calendar, Bell, ChevronRight, Award, Flame, Coins, Sparkles, PlayCircle, Library, Landmark, GraduationCap, CheckCircle
} from "lucide-react";

// Premium Odisha Educational Sub-Exams metadata dictionary
const SUB_EXAMS_META: Record<string, {
  id: string;
  name: string;
  short: string;
  badge: string;
  icon: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  divisions: { id: string; label: string }[];
}> = {
  // Board Exams group
  cbse: {
    id: "cbse",
    name: "CBSE board",
    short: "CBSE",
    badge: "National",
    icon: "GraduationCap",
    description: "Central Board mock tests for Class 10th candidates",
    bgColor: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200 hover:border-amber-400",
    textColor: "text-amber-800",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "mth", label: "10th Class Mathematics" },
      { id: "sci", label: "10th Class Science" }
    ]
  },
  bse: {
    id: "bse",
    name: "BSE Odisha",
    short: "BSE Board",
    badge: "State Board",
    icon: "Library",
    description: "Odisha State Board - Class 9th & Class 10th mock papers",
    bgColor: "from-orange-50 to-red-50",
    borderColor: "border-orange-200 hover:border-orange-400",
    textColor: "text-orange-950",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "9", label: "9th Class Paper" },
      { id: "10", label: "10th Class Paper" }
    ]
  },
  chse: {
    id: "chse",
    name: "CHSE Odisha (+2)",
    short: "CHSE +2",
    badge: "Higher Secondary",
    icon: "BookOpen",
    description: "State 12th class mock sets with core PCM & language",
    bgColor: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-200 hover:border-yellow-400",
    textColor: "text-amber-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "12", label: "12th Class Only" }
    ]
  },
  // Teaching Exams group
  otet: {
    id: "otet",
    name: "OTET",
    short: "Odisha TET",
    badge: "Eligibility",
    icon: "Award",
    description: "Primary and Upper primary school teacher state eligibility",
    bgColor: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    textColor: "text-blue-800",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "p1-arts", label: "Paper-I Arts" },
      { id: "p1-sci", label: "Paper-I Science" },
      { id: "p2-arts", label: "Paper-II Arts" },
      { id: "p2-sci", label: "Paper-II Science" }
    ]
  },
  osstet: {
    id: "osstet",
    name: "OSSTET",
    short: "Secondary TET",
    badge: "Eligibility",
    icon: "GraduationCap",
    description: "Secondary school eligibility for general and special subjects",
    bgColor: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200 hover:border-indigo-400",
    textColor: "text-indigo-850",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "tgt-arts", label: "TGT Arts" },
      { id: "tgt-cbz", label: "TGT CBZ" },
      { id: "tgt-pcm", label: "TGT PCM" },
      { id: "tgt-sanskrit", label: "TGT Sanskrit" },
      { id: "tgt-hindi", label: "TGT Hindi" },
      { id: "tgt-odia", label: "TGT Odia" },
      { id: "tgt-pet", label: "TGT P.ET" }
    ]
  },
  ossc_tgt: {
    id: "ossc_tgt",
    name: "OSSC TGT",
    short: "OSSC Teacher",
    badge: "Recruitment",
    icon: "BookOpen",
    description: "State Commission's Trained Graduate Teacher vacancy mock",
    bgColor: "from-cyan-50 to-blue-50",
    borderColor: "border-cyan-200 hover:border-cyan-400",
    textColor: "text-cyan-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "tgt-arts", label: "TGT Arts" },
      { id: "tgt-cbz", label: "TGT CBZ" },
      { id: "tgt-pcm", label: "TGT PCM" },
      { id: "tgt-sanskrit", label: "TGT Sanskrit" },
      { id: "tgt-hindi", label: "TGT Hindi" },
      { id: "tgt-odia", label: "TGT Odia" },
      { id: "tgt-pet", label: "TGT P.ET" }
    ]
  },
  ssb_tgt: {
    id: "ssb_tgt",
    name: "SSB TGT",
    short: "SSB Teacher",
    badge: "Recruitment",
    icon: "Library",
    description: "State Selection Board non-government school TGT recruitment",
    bgColor: "from-purple-50 to-fuchsia-50",
    borderColor: "border-purple-200 hover:border-purple-400",
    textColor: "text-purple-850",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "tgt-arts", label: "TGT Arts" },
      { id: "tgt-cbz", label: "TGT CBZ" },
      { id: "tgt-pcm", label: "TGT PCM" },
      { id: "tgt-sanskrit", label: "TGT Sanskrit" },
      { id: "tgt-hindi", label: "TGT Hindi" },
      { id: "tgt-odia", label: "TGT Odia" },
      { id: "tgt-pet", label: "TGT P.ET" }
    ]
  },
  jt: {
    id: "jt",
    name: "Junior Teacher (JT)",
    short: "Junior Teacher",
    badge: "Primary recruitment",
    icon: "Sparkles",
    description: "Primary & Upper primary contract teacher test series",
    bgColor: "from-fuchsia-50 to-pink-50",
    borderColor: "border-fuchsia-200 hover:border-fuchsia-400",
    textColor: "text-fuchsia-850",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "p1-arts", label: "Paper-I Arts" },
      { id: "p1-sci", label: "Paper-I Science" },
      { id: "p2-arts", label: "Paper-II Arts" },
      { id: "p2-sci", label: "Paper-II Science" }
    ]
  },
  pet: {
    id: "pet",
    name: "P.ET Exam",
    short: "P.ET Specialist",
    badge: "Special Teacher",
    icon: "Trophy",
    description: "Physical Education state teacher exams and rules",
    bgColor: "from-rose-50 to-orange-50",
    borderColor: "border-rose-200 hover:border-rose-400",
    textColor: "text-rose-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "pet-general", label: "Physical Education Paper Only" }
    ]
  },
  bed_entrance: {
    id: "bed_entrance",
    name: "B.Ed. Entrance",
    short: "B.ED Entrance",
    badge: "Admission Entrance",
    icon: "GraduationCap",
    description: "State teacher training colleges counseling entrance exam",
    bgColor: "from-sky-50 to-cyan-50",
    borderColor: "border-sky-200 hover:border-sky-400",
    textColor: "text-sky-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "arts", label: "Arts Entrance" },
      { id: "sci", label: "Science Entrance" }
    ]
  },
  deled_entrance: {
    id: "deled_entrance",
    name: "DELED / CT Entrance",
    short: "CT Entrance",
    badge: "Certification",
    icon: "CheckCircle",
    description: "Odisha Diploma in Elementary ed integrated common mock test",
    bgColor: "from-teal-50 to-emerald-50",
    borderColor: "border-teal-200 hover:border-teal-400",
    textColor: "text-teal-950",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "ct-integrated", label: "Integrated CT Paper Only" }
    ]
  },
  // Competitive / Others group
  opsc_ocs: {
    id: "opsc_ocs",
    name: "OPSC Civil Services",
    short: "OPSC OCS",
    badge: "Class I / State PSC",
    icon: "Landmark",
    description: "Odisha Civil Services prelims general studies and CSAT papers",
    bgColor: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    textColor: "text-emerald-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "pre-1", label: "GS Paper I" },
      { id: "pre-2", label: "CSAT Paper II" }
    ]
  },
  osssc_ri: {
    id: "osssc_ri",
    name: "OSSSC Revenue Inspector (RI)",
    short: "OSSSC RI",
    badge: "Revenue Group-C",
    icon: "BookOpen",
    description: "Revenue Inspector, Assistant RI, Amin state level screening",
    bgColor: "from-teal-50 to-lime-50",
    borderColor: "border-teal-200 hover:border-teal-400",
    textColor: "text-teal-850",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "math", label: "RI Mathematics" },
      { id: "full", label: "Full Syllabus Mock" }
    ]
  },
  ossc_cgl: {
    id: "ossc_cgl",
    name: "OSSC CGL",
    short: "OSSC Graduate Level",
    badge: "Group-B Services",
    icon: "Library",
    description: "Combined Graduate level general aptitude and written screening",
    bgColor: "from-lime-50 to-emerald-50",
    borderColor: "border-lime-200 hover:border-lime-400",
    textColor: "text-emerald-950",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "cgl-pre-1", label: "CGL Prelims mock" }
    ]
  },
  police_si: {
    id: "police_si",
    name: "Odisha Police SI",
    short: "Police SI & Constable",
    badge: "Uniform Service",
    icon: "Trophy",
    description: "Odisha Sub-Inspector general english and physical ability standard",
    bgColor: "from-orange-50 to-rose-50",
    borderColor: "border-orange-200 hover:border-orange-400",
    textColor: "text-orange-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "si-1", label: "SI Mains Mock" }
    ]
  },
  computer_skill: {
    id: "computer_skill",
    name: "DCA & Computer Skills",
    short: "OSSSC Practical",
    badge: "Technical Eligibility",
    icon: "Sparkles",
    description: "Windows operating system basic software shortcuts, Excel & Word tests",
    bgColor: "from-blue-50 to-sky-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    textColor: "text-blue-900",
    divisions: [
      { id: "all", label: "All Papers" },
      { id: "comp-skill-1", label: "DCA Practical Set" }
    ]
  }
};

interface StudentDashboardProps {
  userProfile: UserProfile;
  exams: {
    board: Exam[];
    teaching: Exam[];
    competitive: Exam[];
    others: Exam[];
  };
  onStartTest: (testId: string) => void;
  onNavigate: (tab: string) => void;
  onClaimDailyReward: () => void;
}

export default function StudentDashboard({
  userProfile,
  exams,
  onStartTest,
  onNavigate,
  onClaimDailyReward
}: StudentDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<"board" | "teaching" | "others">("board");
  // Sub-category and Division filter states
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("cbse");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [dashboardStep, setDashboardStep] = useState<"categories" | "subexams" | "mocktests">("categories");

  // React effect to align standard defaults safely when category is selected
  React.useEffect(() => {
    if (selectedCategory === "board") {
      setSelectedSubCategory("cbse");
    } else if (selectedCategory === "teaching") {
      setSelectedSubCategory("otet");
    } else {
      setSelectedSubCategory("computer_skill");
    }
    setSelectedDivision("all");
  }, [selectedCategory]);

  // Greeting helper based on time with beautiful responsive emojis
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Suprabhata ☀️ / Good Morning";
    if (hrs < 17) return "Abhinandan 🌤️ / Good Afternoon";
    return "Subhasandhya 🌙 / Good Evening";
  };

  // Safe category counting helper
  const getSubExamCount = (cat: "board" | "teaching" | "others") => {
    if (cat === "others") {
      return 1; // Only DCA & Computer skills remain
    }
    return exams[cat]?.length || 0;
  };

  const getSyllabusProgress = () => {
    switch (selectedCategory) {
      case "board": return 88;
      case "teaching": return 65;
      case "others": return 74;
      default: return 50;
    }
  };

  // Helper renderer to securely show Lucide icons dynamically
  const renderSubIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "Library": return <Library className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "BookOpen": return <BookOpen className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "Award": return <Award className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "Trophy": return <Trophy className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "Sparkles": return <Sparkles className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "Landmark": return <Landmark className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      case "CheckCircle": return <CheckCircle className={`h-6 w-6 shrink-0 ${colorClass}`} />;
      default: return <BookOpen className={`h-6 w-6 shrink-0 ${colorClass}`} />;
    }
  };

  return (
    <div className="space-y-6" id="student-dashboard">
      {/* 1. Header Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <div className="w-64 h-64 rounded-full border-8 border-white border-dashed animate-spin-slow"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-14">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
              Active Odisha Aspirant
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-3 mb-1">
              {getGreeting()}, {userProfile.name}!
            </h2>
            <p className="text-xs text-blue-200 flex items-center gap-1.5 font-mono">
              District: <span className="text-amber-300 font-bold">{userProfile.district}</span>
            </p>
          </div>

          {/* Gamified Core Stats Dashboard */}
          <div className="flex flex-wrap items-center gap-4 bg-white/10 p-3.5 rounded-2xl border border-white/15 backdrop-blur-xs">
            {/* Streak */}
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <Flame className="h-5 w-5 text-orange-400 fill-orange-500" />
              <div>
                <span className="block text-[10px] text-blue-200 leading-none font-bold uppercase">Streak</span>
                <span className="text-sm font-black text-white">{userProfile.streak}d</span>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <Coins className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <div>
                <span className="block text-[10px] text-blue-200 leading-none font-bold uppercase">Coins</span>
                <span className="text-sm font-black text-white">{userProfile.coins}</span>
              </div>
            </div>

            {/* XP */}
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <div>
                <span className="block text-[10px] text-blue-200 leading-none font-bold uppercase">Rank Points</span>
                <span className="text-sm font-black text-white">{userProfile.xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Hub Title */}
      <AnimatePresence mode="wait">
        {dashboardStep === "categories" && (
          <motion.div
            key="categories-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center md:text-left py-2 font-medium">
              <h3 className="text-lg font-black tracking-tight text-blue-950">Select Mock Exam Track</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Click on any sector page below to view detailed sub-exams & access the 10-set paper test series.
              </p>
            </div>

            {/* 3. The 3 Exam Categories GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
              {/* Category A: Board Exams */}
              <button
                onClick={() => {
                  setSelectedCategory("board");
                  setDashboardStep("subexams");
                }}
                className="relative p-6 rounded-3xl text-left border cursor-pointer bg-white border-slate-200 hover:border-amber-400 hover:shadow-xl group active:scale-[0.98] transition-all duration-300 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors duration-300 shadow-sm">
                      <GraduationCap className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                      {getSubExamCount("board")} Exams
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest block mb-1">Priority I</span>
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-amber-600 transition-colors">🏫 1. Board Exams</h4>
                  <span className="text-xs text-slate-400 block mt-1.5 leading-relaxed">Class 10 (BSE) & Class 12 (CHSE) mock tests</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-amber-600 font-mono tracking-wider">
                  <span>Explore Sector</span>
                  <div className="p-1 rounded-lg bg-amber-50 group-hover:bg-amber-100 text-amber-700 transition-all">
                    <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Category B: Teaching Exams */}
              <button
                onClick={() => {
                  setSelectedCategory("teaching");
                  setDashboardStep("subexams");
                }}
                className="relative p-6 rounded-3xl text-left border cursor-pointer bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl group active:scale-[0.98] transition-all duration-300 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Library className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                      {getSubExamCount("teaching")} Exams
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">Priority II</span>
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">👨‍🏫 2. Teaching Exams</h4>
                  <span className="text-xs text-slate-400 block mt-1.5 leading-relaxed">OTET, OSSTET and state pedagogy preparation</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-indigo-600 font-mono tracking-wider">
                  <span>Explore Sector</span>
                  <div className="p-1 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 text-indigo-700 transition-all">
                    <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Category C: Others Exams */}
              <button
                onClick={() => {
                  setSelectedCategory("others");
                  setDashboardStep("subexams");
                }}
                className="relative p-6 rounded-3xl text-left border cursor-pointer bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xl group active:scale-[0.98] transition-all duration-300 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                      <BookOpen className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                      {getSubExamCount("others")} Exam Track
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest block mb-1">Priority III</span>
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-emerald-600 transition-colors">🚀 3. Other Exams</h4>
                  <span className="text-xs text-slate-400 block mt-1.5 leading-relaxed">DCA, Computer Skills & general education tracks</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-emerald-600 font-mono tracking-wider">
                  <span>Explore Sector</span>
                  <div className="p-1 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 text-emerald-750 transition-all">
                    <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* 5. Minimalistic Double Row (Syllabus Gauge & Daily Booster claiming) */}
            <div className="grid md:grid-cols-2 gap-6 font-medium">
              {/* Daily Bonus Claim Notification */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black font-mono">
                    DAILY BOOSTER
                  </span>
                  <h4 className="font-extrabold text-amber-900 text-sm mt-3 mb-1">Boost Your Academic Rank!</h4>
                  <p className="text-xs text-slate-600 leading-normal font-semibold">
                    Claim your daily exam credits (+50 XP, +20 Coins) to keep your streak healthy and unlock free premium test series.
                  </p>
                </div>
                <button
                  onClick={onClaimDailyReward}
                  className="w-full mt-4 text-center py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Claim Daily Booster Points
                </button>
              </div>

              {/* General Syllabus Progress */}
              <div className="bg-white border border-slate-205 rounded-3xl p-6 flex flex-col justify-between font-medium">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wide">Syllabus Completion Gauge</span>
                    <span className="text-orange-500 font-extrabold text-xs">{getSyllabusProgress()}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-4 leading-normal font-semibold">Based on test history and accuracy in our mock database.</p>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${getSyllabusProgress()}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 font-semibold">
                  <span className="text-[10px] px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg flex items-center gap-1 font-semibold">
                    <CheckCircle className="h-3 w-3" /> State Rank Matcher Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {dashboardStep === "subexams" && (
          <motion.div
            key="subexams-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Back Button and Path Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200">
              <button
                onClick={() => setDashboardStep("categories")}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit shadow-xs active:scale-95"
              >
                ← Back to Categories Menu
              </button>
              <div className="text-left font-semibold">
                <span className="text-[10px] uppercase font-black text-amber-600 bg-amber-50 border border-amber-150 px-3 py-1 rounded-lg font-mono">
                  Track: {selectedCategory === "board" ? "Board Exams" : selectedCategory === "teaching" ? "Teaching Recruitments" : "Competitive Exams"}
                </span>
              </div>
            </div>

            {/* Sub-exam list presentation heading */}
            <div className="bg-slate-100/60 p-5 rounded-3xl border border-slate-150">
              <h3 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                {selectedCategory === "board" && "Board Exam Hubs"}
                {selectedCategory === "teaching" && "Teacher Training & Professional Credentials"}
                {selectedCategory === "others" && "Commissions & Career Growth Exams"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold font-medium">
                Click on any sub-exam big box below to enter and generate its corresponding suite of exactly 10-set professional Mock Exams.
              </p>
            </div>

            {/* Grid of boxes represent subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-medium">
              {(() => {
                const activeIds = selectedCategory === "board" 
                  ? ["cbse", "bse", "chse"]
                  : selectedCategory === "teaching"
                    ? ["otet", "osstet", "ossc_tgt", "ssb_tgt", "jt", "pet", "bed_entrance", "deled_entrance"]
                    : ["computer_skill"];

                return activeIds.map((subId) => {
                  const meta = SUB_EXAMS_META[subId];
                  if (!meta) return null;

                  return (
                    <button
                      key={subId}
                      onClick={() => {
                        setSelectedSubCategory(subId);
                        setSelectedDivision("all"); // Reset divisions on sub-exam switch
                        setDashboardStep("mocktests"); // Go to next page!
                      }}
                      className="relative p-5 rounded-3xl cursor-pointer text-left transition-all border bg-white border-slate-200 hover:border-orange-500 hover:shadow-lg group flex flex-col justify-between h-full min-h-[175px] active:scale-[0.98] duration-300"
                    >
                      <div>
                        {/* Header row in big box */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-xs">
                            {renderSubIcon(meta.icon, "text-slate-700 group-hover:text-white transition-colors")}
                          </div>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase bg-slate-100 text-slate-650 group-hover:bg-orange-100 group-hover:text-orange-950 transition-colors font-bold">
                            {meta.badge}
                          </span>
                        </div>

                        {/* Info block */}
                        <h4 className="font-extrabold text-blue-950 text-sm leading-tight mb-1 group-hover:text-orange-600 transition-colors">
                          {meta.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 font-semibold">
                          {meta.description}
                        </p>
                      </div>

                      {/* Indicator dots or status */}
                      <div className="border-t border-slate-100 pt-3 mt-4 w-full flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400 group-hover:text-orange-600 transition-colors font-mono">
                          Explore Series
                        </span>
                        <div className="p-0.5 rounded-lg text-slate-300 group-hover:text-orange-500 transform group-hover:translate-x-0.5 transition-all">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </motion.div>
        )}

        {dashboardStep === "mocktests" && (
          <motion.div
            key="mocktests-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Nav back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200">
              <button
                onClick={() => setDashboardStep("subexams")}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-orange-950 bg-orange-100/70 hover:bg-orange-150 px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit shadow-xs active:scale-95"
              >
                ← Back to Sub-Exams Hub
              </button>
              <div className="font-semibold">
                <span className="text-[10px] font-mono font-bold text-orange-850 bg-orange-50 border border-orange-150 px-3 py-1.5 rounded-lg shrink-0">
                  Active Hub: {SUB_EXAMS_META[selectedSubCategory]?.name || "Odisha Track"}
                </span>
              </div>
            </div>

            {/* Selected Sub-Exam Information Greeting Card */}
            {(() => {
              const meta = SUB_EXAMS_META[selectedSubCategory];
              if (!meta) return null;
              return (
                <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
                  <div className="relative z-10 font-medium">
                    <span className="text-[9px] font-black tracking-widest font-mono uppercase text-orange-400 bg-black/30 px-2.5 py-0.5 rounded-full border border-orange-500/30 font-bold">
                      Syllabus Series Activated
                    </span>
                    <h3 className="text-xl font-black mt-3 mb-1 tracking-tight">{meta.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-semibold">
                      {meta.description}. All mock tests are designed in full alignment with the official state exam syllabus.
                    </p>
                  </div>
                  <div className="flex gap-2 relative z-10 shrink-0 font-medium">
                    <span className="text-[10px] px-3.5 py-1.5 bg-orange-500 text-white border border-orange-600 rounded-xl font-mono font-black shadow-xs">
                      10 Tests Ready
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 5. Sub-division PILLS (Pills row inside Selected sub_category) */}
            {(() => {
              const currentMeta = SUB_EXAMS_META[selectedSubCategory];
              if (!currentMeta || currentMeta.divisions.length <= 1) return null;

              return (
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-150">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-2 font-mono font-semibold">
                    Filter by Class / Syllabus Stream:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentMeta.divisions.map((div) => {
                      const isActive = selectedDivision === div.id;
                      return (
                        <button
                          key={div.id}
                          onClick={() => setSelectedDivision(div.id)}
                          className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                            isActive
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {div.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 6. Mock practice sets grid matching the selected sub_category + selected division filtered */}
            <div className="space-y-6">
              {(() => {
                const activeExamsList = selectedCategory === "others"
                  ? [...(exams.competitive || []), ...(exams.others || [])]
                  : (exams[selectedCategory] || []);

                const currentExam = activeExamsList.find(e => e.subCategory === selectedSubCategory || e.id === selectedSubCategory);
                const currentMeta = SUB_EXAMS_META[selectedSubCategory];

                if (!currentMeta) {
                  return (
                    <div className="col-span-full py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 w-full font-semibold">
                      Practice sets for this state sub-category are currently loading dynamically. Click the AI Advisor button to view syllabi.
                    </div>
                  );
                }

                // Helper division matcher
                const matchDivision = (testId: string, testTitle: string, divId: string) => {
                  if (divId === "all") return true;
                  const tId = testId.toLowerCase();
                  const tTitle = testTitle.toLowerCase();
                  
                  if (divId === "mth" || divId === "math") {
                    return tId.includes("mth") || tId.includes("math") || tTitle.includes("math") || tTitle.includes("algebra") || tTitle.includes("quant");
                  }
                  if (divId === "sci" || divId === "pcm" || divId === "cbz") {
                    return tId.includes("sci") || tId.includes("pcm") || tId.includes("cbz") || tId.includes("phy") || tTitle.includes("science") || tTitle.includes("physics") || tTitle.includes("chemistry") || tTitle.includes("botany") || tTitle.includes("zoology") || tTitle.includes("evs");
                  }
                  if (divId === "arts" || divId === "sanskrit" || divId === "hindi" || divId === "odia" || divId.includes("arts")) {
                    return tId.includes("arts") || tId.includes("sanskrit") || tId.includes("hindi") || tId.includes("odia") || tTitle.includes("arts") || tTitle.includes("social") || tTitle.includes("history") || tTitle.includes("geography") || tTitle.includes("language") || tTitle.includes("grammar") || tTitle.includes("vyakarana") || tTitle.includes("pedagogy") || tTitle.includes("child") || tTitle.includes("literature") || tTitle.includes("sahitya");
                  }
                  if (divId === "pet") {
                    return tId.includes("pet") || tTitle.includes("physical") || tTitle.includes("health");
                  }
                  if (divId === "9") {
                    return tId.includes("-9-") || tId.includes("class-9") || tTitle.includes("class 9") || tTitle.includes("class ix") || tTitle.includes("9th");
                  }
                  if (divId === "10") {
                    return tId.includes("-10-") || tId.includes("class-10") || tTitle.includes("class 10") || tTitle.includes("class x") || tTitle.includes("10th");
                  }
                  if (divId === "12") {
                    return tId.includes("-12-") || tId.includes("class-12") || tTitle.includes("class 12") || tTitle.includes("class xii") || tTitle.includes("12th") || tTitle.includes("optics") || tTitle.includes("calculus");
                  }
                  return tId.includes(divId) || tTitle.includes(divId);
                };

                const officialTests = currentExam?.tests || [];
                const filteredOfficial = officialTests.filter((t: any) => matchDivision(t.id, t.title, selectedDivision));

                return (
                  <div className="space-y-8">
                    {/* SECTION 1: OFFICIAL PAPERS & ADMIN CUSTOM UPLOADS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        <h4 className="text-xs uppercase font-black text-rose-900 tracking-wider font-mono">
                          📋 Official Curriculum CBT Papers & Live Admin Uploads ({filteredOfficial.length})
                        </h4>
                      </div>

                      {filteredOfficial.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 bg-slate-50 border border-slate-150 rounded-2xl text-xs font-semibold">
                          No customized or uploaded tests found matching this stream. Try checking other subjects/divisions or upload files in the Admin Panel!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredOfficial.map((test: any) => {
                            const isUploaded = test.isCustom || test.id.includes("-parsed-");
                            
                            // Extract metadata with fallbacks
                            const testQuestionsCount = test.questionsCount || currentExam?.totalQuestions || 5;
                            const testDuration = test.durationMins || currentExam?.durationMins || 90;
                            const testNegative = test.negativeMarking !== undefined ? test.negativeMarking : (currentExam?.negativeMarking || 0);
                            const testMarks = test.marksPerQuestion || currentExam?.marksPerQuestion || 1;

                            return (
                              <div
                                key={test.id}
                                className="bg-white border-2 border-slate-200 hover:border-rose-450 hover:shadow-lg rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                              >
                                {/* Active Upload Banner */}
                                {isUploaded && (
                                  <div className="absolute top-0 right-0 bg-rose-500 text-white font-mono text-[8px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase">
                                    Admin Active Live
                                  </div>
                                )}

                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-4">
                                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider font-mono border ${
                                      isUploaded
                                        ? "bg-rose-50 text-rose-700 border-rose-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                                    }`}>
                                      {isUploaded ? "🔥 Admin Upload" : "📋 State CBT Paper"}
                                    </span>
                                    
                                    <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {testDuration} Mins
                                    </span>
                                  </div>

                                  <div className="mb-3">
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5 leading-none">
                                      {currentMeta.short} Official Track
                                    </span>
                                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight mb-2 min-h-[40px] leading-snug">
                                      {test.title}
                                    </h4>
                                    {test.uploadedAt && (
                                      <span className="text-[9px] text-slate-400 font-bold block mb-1">
                                        Uploaded: {new Date(test.uploadedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 py-2.5 px-3 bg-slate-50 rounded-2xl my-3 text-[10px] text-slate-650 font-semibold border border-slate-100">
                                    <div>Questions: <span className="text-slate-900 font-black">{testQuestionsCount} MCQs</span></div>
                                    <div>Difficulty: <span className="text-orange-600 font-black">Official Std</span></div>
                                    <div>Weight: <span className="text-slate-900 font-black">+{testMarks} Marks</span></div>
                                    <div>Penalty: <span className="text-red-500 font-black">-{testNegative} Wrong</span></div>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <button
                                    onClick={() => onStartTest(test.id)}
                                    className="w-full py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs bg-rose-600 hover:bg-rose-750 hover:shadow-md text-white group-hover:scale-[1.01]"
                                  >
                                    <PlayCircle className="h-4 w-4 shrink-0" />
                                    Launch Exam Paper
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: SIMULATED PRACTICE DRILLS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse"></span>
                        <h4 className="text-xs uppercase font-black text-slate-505 tracking-wider font-mono">
                          ⚡ AI Simulated Syllabus Practice Drills (10 sets)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 10 }, (_, index) => {
                          const testNumber = index + 1;
                          
                          let activeDivKeyword = selectedDivision;
                          if (selectedDivision === "all") {
                            const subId = selectedSubCategory.toLowerCase();
                            if (subId.includes("cbse") || subId.includes("bse")) {
                              activeDivKeyword = testNumber % 2 === 0 ? "sci" : "mth";
                            } else if (subId.includes("chse")) {
                              activeDivKeyword = "pcm";
                            } else if (subId.includes("otet") || subId.includes("jt") || subId.includes("bed") || subId.includes("deled")) {
                              activeDivKeyword = testNumber % 2 === 0 ? "sci" : "arts";
                            } else if (subId.includes("osstet") || subId.includes("tgt") || subId.includes("ssb")) {
                              if (testNumber % 3 === 0) activeDivKeyword = "pcm";
                              else if (testNumber % 3 === 1) activeDivKeyword = "arts";
                              else activeDivKeyword = "pet";
                            } else if (subId.includes("pet")) {
                              activeDivKeyword = "pet";
                            } else if (subId.includes("ri")) {
                              activeDivKeyword = "math";
                            } else {
                              activeDivKeyword = "general";
                            }
                          }

                          const generatedTestId = `${selectedSubCategory}-${activeDivKeyword}-mock-${testNumber}`;

                          let divisionLabel = "";
                          if (selectedDivision !== "all") {
                            const divObj = currentMeta.divisions.find(d => d.id === selectedDivision);
                            divisionLabel = divObj ? divObj.label : "";
                          } else {
                            if (activeDivKeyword === "mth" || activeDivKeyword === "math") divisionLabel = "Mathematics Section";
                            else if (activeDivKeyword === "sci" || activeDivKeyword === "pcm" || activeDivKeyword === "cbz") divisionLabel = "Science Stream";
                            else if (activeDivKeyword === "arts" || activeDivKeyword === "sanskrit" || activeDivKeyword === "hindi" || activeDivKeyword === "odia") divisionLabel = "Arts & Languages";
                            else if (activeDivKeyword === "pet") divisionLabel = "Physical Education";
                            else divisionLabel = "Core Curriculum Paper";
                          }

                          const isPremiumLocked = testNumber > 4;
                          
                          return (
                            <div
                              key={generatedTestId}
                              className="bg-slate-50/50 border border-slate-150 hover:border-orange-400 hover:shadow-lg hover:bg-white rounded-3xl p-5 transition-all duration-350 flex flex-col justify-between relative overflow-hidden group"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-orange-400/5 to-amber-500/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider font-mono border ${
                                    isPremiumLocked
                                      ? "bg-blue-50 text-blue-700 border-blue-105"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-105"
                                  }`}>
                                    {isPremiumLocked ? "🌟 Standard Set" : "🆓 Free Trial"}
                                  </span>
                                  
                                  <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {currentExam?.durationMins || 90} Mins
                                  </span>
                                </div>

                                <div className="mb-3">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5 leading-none">
                                    {currentMeta.short} Paper Set
                                  </span>
                                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight mb-1 flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${isPremiumLocked ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`}></span>
                                    Series {testNumber} - Mock Paper
                                  </h4>
                                  <span className="text-[11px] text-orange-600 font-bold block leading-none font-mono">
                                    {divisionLabel}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 py-2.5 px-3 bg-white rounded-2xl my-3 text-[10px] text-slate-650 font-semibold border border-slate-100">
                                  <div>Questions: <span className="text-slate-900 font-black">{currentExam?.totalQuestions || 5} MCQs</span></div>
                                  <div>Difficulty: <span className="text-orange-600 font-black">{testNumber <= 3 ? "Easy" : testNumber <= 7 ? "Medium" : "Hard"}</span></div>
                                  <div>Weight: <span className="text-slate-900 font-black">+{currentExam?.marksPerQuestion || 1} Correct</span></div>
                                  <div>Penalty: <span className="text-red-500 font-black">-{currentExam?.negativeMarking || 0.25} Wrong</span></div>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <button
                                  onClick={() => onStartTest(generatedTestId)}
                                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all duration-350 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                                    isPremiumLocked
                                      ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg group-hover:scale-[1.01]"
                                      : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg group-hover:scale-[1.01]"
                                  }`}
                                >
                                  <PlayCircle className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                                  Mock Test {testNumber}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
