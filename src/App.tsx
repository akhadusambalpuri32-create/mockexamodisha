/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Exam, Question, SavedNote } from "./types";
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, signOut, testConnection } from "./firebase";

// Component imports
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import StudentDashboard from "./components/StudentDashboard";
import MockTestInterface from "./components/MockTestInterface";
import ResultAnalytics from "./components/ResultAnalytics";
import AIDoubtSolver from "./components/AIDoubtSolver";
import LeaderboardSection from "./components/LeaderboardSection";
import StudyMaterialSection from "./components/StudyMaterialSection";
import VideoLearningHub from "./components/VideoLearningHub";
import SubscriptionPage from "./components/SubscriptionPage";
import AdminPanel from "./components/AdminPanel";

// Lucide icons
import {
  GraduationCap, BookOpen, Trophy, Sparkles, Download, PlayCircle, ShieldAlert, BadgeInfo, LogOut, LayoutDashboard, Heart, Settings, Flame, Bell, MapPin, User, ChevronRight, Menu, X, ToggleLeft
} from "lucide-react";

const mergeWithLocalExams = (serverExams: any) => {
  const localExamsStr = localStorage.getItem("kalinga_custom_exams_db");
  if (!localExamsStr) return serverExams;

  try {
    const localExams = JSON.parse(localExamsStr);
    if (!localExams || typeof localExams !== "object") return serverExams;

    const merged = { ...serverExams };
    const categories = ["board", "teaching", "competitive", "others"];

    categories.forEach((cat) => {
      if (!merged[cat]) merged[cat] = [];
      const localCatList = localExams[cat] || [];

      localCatList.forEach((localExam: any) => {
        const foundIdx = merged[cat].findIndex((e: any) => e.id === localExam.id);
        if (foundIdx === -1) {
          merged[cat].push(localExam);
        } else {
          const serverExam = merged[cat][foundIdx];
          const mergedTests = [...(serverExam.tests || [])];
          
          (localExam.tests || []).forEach((localTest: any) => {
            if (!mergedTests.some((t: any) => t.id === localTest.id)) {
              mergedTests.push(localTest);
            }
          });
          
          merged[cat][foundIdx] = {
            ...serverExam,
            ...localExam,
            tests: mergedTests
          };
        }
      });
    });

    return merged;
  } catch (e) {
    console.error("Failed to parse local exams database backup:", e);
    return serverExams;
  }
};

export default function App() {
  // Navigation State
  // "landing" | "auth" | "dashboard"
  const [appState, setAppState] = useState<"landing" | "auth" | "dashboard">("dashboard");
  // Active sub-tab inside the dashboard: "home" | "tests" | "ai-advisor" | "leaderboards" | "study-material" | "video-academy" | "subscription" | "admin-portal"
  const [activeTab, setActiveTab] = useState<string>("home");

  // Auth User state (defaults to Guest so there is no blank screen or flashing)
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    name: "Guest Scholar 🔓",
    email: "guest@odishaedu.in",
    mobile: "9437011223",
    examTarget: "cbse",
    district: "Khordha",
    coins: 100,
    xp: 155,
    streak: 3,
    badges: [],
    savedNotes: [],
    testHistory: [],
    isGuest: true
  });

  // Authentication initial token checking loading state
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  // Rotate loading steps for visual amusement and feedback
  useEffect(() => {
    if (!authLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 60);
    return () => clearInterval(interval);
  }, [authLoading]);

  // Register Firebase Auth real-time event listener
  useEffect(() => {
    // Run connection test in background so it never blocks the critical path
    setTimeout(() => {
      testConnection();
    }, 150);

    // Initial session loading timeout for ultra-fast response
    const loaderLimit = setTimeout(() => {
      setAuthLoading((prev) => {
        if (prev) {
          console.log("Auth load timeout triggered to speed up initial transition.");
          return false;
        }
        return prev;
      });
    }, 250); // Strict safety cap of 250ms to guarantee swift load times

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            let docData: any = null;
            try {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (userDoc && userDoc.exists()) {
                docData = userDoc.data();
                // Cache locally
                localStorage.setItem(`kalinga_user_${firebaseUser.uid}`, JSON.stringify(docData));
              }
            } catch (offlineErr) {
              console.warn("Could not get document from server (offline). Checking localStorage fallback...", offlineErr);
              const cached = localStorage.getItem(`kalinga_user_${firebaseUser.uid}`);
              if (cached) {
                try {
                  docData = JSON.parse(cached);
                } catch (parseErr) {
                  console.error("Invalid localCache data:", parseErr);
                }
              }
            }

            // Safe fallback if even localStorage is empty
            if (!docData) {
              docData = {
                name: firebaseUser.displayName || "Scholarly Aspirant",
                email: firebaseUser.email || "",
                mobile: firebaseUser.phoneNumber || "9437011223",
                examTarget: "cbse",
                district: "Khordha",
                coins: 100,
                xp: 10,
                streak: 1,
                badges: [
                  { id: "b-onboarding", title: "Biju Shravak", description: "Registered profile successfully on platform", icon: "GraduationCap", unlockedAt: new Date().toLocaleDateString() }
                ],
                savedNotes: [],
                testHistory: []
              };
            }

            // Read guest's cached test history to merge, to prevent losing newly given tests when switching from Guest to Authenticated
            let cachedGuestData: any = null;
            const cachedGuestStr = localStorage.getItem("kalinga_user_guest");
            if (cachedGuestStr) {
              try {
                cachedGuestData = JSON.parse(cachedGuestStr);
              } catch (_) {}
            }

            const guestHistory = (cachedGuestData && cachedGuestData.testHistory) || [];
            const guestNotes = (cachedGuestData && cachedGuestData.savedNotes) || [];
            const guestBadges = (cachedGuestData && cachedGuestData.badges) || [];

            const originalTestHistory = docData.testHistory || [];
            const mergedHistory = [...originalTestHistory];
            guestHistory.forEach((item: any) => {
              if (!mergedHistory.some((h: any) => h.testId === item.testId && h.attemptedAt === item.attemptedAt)) {
                mergedHistory.push(item);
              }
            });

            const originalSavedNotes = docData.savedNotes || [];
            const mergedNotes = [...originalSavedNotes];
            guestNotes.forEach((item: any) => {
              if (!mergedNotes.some((n: any) => n.id === item.id)) {
                mergedNotes.unshift(item); // prepend
              }
            });

            const originalBadges = docData.badges || [];
            const mergedBadges = [...originalBadges];
            guestBadges.forEach((item: any) => {
              if (!mergedBadges.some((b: any) => b.id === item.id)) {
                mergedBadges.push(item);
              }
            });

            setUserProfile({
              name: docData.name || firebaseUser.displayName || "Scholarly Aspirant",
              email: firebaseUser.email || docData.email || "",
              mobile: docData.mobile || firebaseUser.phoneNumber || "9437011223",
              examTarget: docData.examTarget || "cbse",
              district: docData.district || "Khordha",
              coins: docData.coins !== undefined ? docData.coins : 100,
              xp: docData.xp !== undefined ? docData.xp : 10,
              streak: docData.streak !== undefined ? docData.streak : 1,
              badges: mergedBadges,
              savedNotes: mergedNotes,
              testHistory: mergedHistory,
              isGuest: false
            });
            setAppState("dashboard");
            setActiveTab("home");
          } catch (err) {
            console.error("Error reading firebase profile list:", err);
          }
        } else {
          // Logged out: fallback gracefully to Guest Scholar inside standard Blue Dashboard
          const cachedGuest = localStorage.getItem("kalinga_user_guest");
          let guestProfile = {
            name: "Guest Scholar 🔓",
            email: "guest@odishaedu.in",
            mobile: "9437011223",
            examTarget: "cbse",
            district: "Khordha",
            coins: 100,
            xp: 155,
            streak: 3,
            badges: [],
            savedNotes: [],
            testHistory: [],
            isGuest: true
          };
          if (cachedGuest) {
            try {
              guestProfile = JSON.parse(cachedGuest);
            } catch (e) {
              console.error("Failed to parse cached guest profile:", e);
            }
          }
          setUserProfile(guestProfile);
          setAppState("dashboard");
        }
      } finally {
        clearTimeout(loaderLimit);
        setAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(loaderLimit);
      unsubscribe();
    };
  }, []);

  // Sync user profile to Firestore/localStorage whenever it changes (auto-saving attempts, badges, stats)
  useEffect(() => {
    if (!userProfile) return;

    if (userProfile.isGuest) {
      // Save Guest progress
      localStorage.setItem("kalinga_user_guest", JSON.stringify(userProfile));
    } else {
      // Save authenticated/local user snapshot to local storage
      const uid = auth.currentUser?.uid;
      const keySuffix = uid || `local_${userProfile.email.replace(/[@.]/g, "_")}`;
      localStorage.setItem(`kalinga_user_${keySuffix}`, JSON.stringify(userProfile));

      if (uid) {
        // Sync to cloud Firestore database in background
        const userDocRef = doc(db, "users", uid);
        setDoc(userDocRef, {
          name: userProfile.name,
          email: userProfile.email,
          mobile: userProfile.mobile,
          examTarget: userProfile.examTarget,
          district: userProfile.district,
          coins: userProfile.coins,
          xp: userProfile.xp,
          streak: userProfile.streak,
          badges: userProfile.badges,
          savedNotes: userProfile.savedNotes,
          testHistory: userProfile.testHistory
        }, { merge: true }).catch((err) => {
          console.error("Failed to sync profile to cloud Firestore:", err);
        });
      }
    }
  }, [userProfile]);

  // Database models loaded from Express Server
  const [examsData, setExamsData] = useState<{
    board: Exam[];
    teaching: Exam[];
    competitive: Exam[];
    others: Exam[];
  }>({
    board: [],
    teaching: [],
    competitive: [],
    others: []
  });

  // Active Exam state
  const [activeTest, setActiveTest] = useState<{
    id: string;
    title: string;
    questions: Question[];
    durationMins: number;
    negativeMarking: number;
    marksPerQuestion: number;
  } | null>(null);

  // Active Scorecard Result State
  const [scorecard, setScorecard] = useState<{
    testId: string;
    testTitle: string;
    correct: number;
    wrong: number;
    totalQuestions: number;
    timeSpent: number;
    negativeMarking?: number;
    marksPerQuestion?: number;
  } | null>(null);

  // Mobile sidebar states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Platform alerts / notifications simulations
  const [alerts, setAlerts] = useState<string[]>([
    "OSSSC Statistical surveyor recruitment dates released!",
    "Sit for Sunday's Weekly Grand Scholarship test to win ₹5,000 cash rewards."
  ]);
  const [activeAlertIdx, setActiveAlertIdx] = useState(0);

  // Load database models from Express API
  useEffect(() => {
    const fetchExams = async () => {
      let loadedData: any = null;
      try {
        const response = await fetch("/api/exams-data");
        if (response.ok) {
          loadedData = await response.json();
        }
      } catch (err) {
        console.error("Failed to load schema from Express backend. Building offline fallback.", err);
      }

      if (loadedData) {
        const merged = mergeWithLocalExams(loadedData);
        setExamsData(merged);
        localStorage.setItem("kalinga_custom_exams_db", JSON.stringify(merged));
      } else {
        // Build dynamic fallback using cached client-side db or the custom mocks
        const cachedExams = localStorage.getItem("kalinga_custom_exams_db");
        if (cachedExams) {
          try {
            setExamsData(JSON.parse(cachedExams));
            return;
          } catch (e) {}
        }

        // If even local storage is empty, fallback to basic mock exams
        const baseMocks = {
          board: [
            {
              id: "bse-10",
              name: "Class 10 - BSE Odisha Board",
              short: "BSE Class 10",
              durationMins: 90,
              totalQuestions: 5,
              difficulty: "Medium",
              marksPerQuestion: 1,
              negativeMarking: 0,
              tests: [
                { id: "bse-mth-1", title: "Class 10 Mathematics Practice Set A", isFree: true }
              ]
            }
          ],
          teaching: [
            {
              id: "otet",
              name: "OTET - Odisha Teacher Eligibility Test",
              short: "OTET",
              durationMins: 150,
              totalQuestions: 5,
              difficulty: "Medium",
              marksPerQuestion: 1,
              negativeMarking: 0,
              tests: [
                { id: "otet-p1", title: "OTET Paper-I Pedagogical Development Mock", isFree: true }
              ]
            }
          ],
          competitive: [
            {
              id: "opsc-ocs",
              name: "OPSC - Odisha Civil Services",
              short: "OPSC OCS",
              durationMins: 120,
              totalQuestions: 5,
              difficulty: "Hard",
              marksPerQuestion: 2,
              negativeMarking: 0.33,
              tests: [
                { id: "ocs-pre-1", title: "OCS General Studies Paper-I (Mock 1)", isFree: true }
              ]
            }
          ],
          others: [
            {
              id: "computer-skill",
              name: "OSSSC Computer Practical Mock",
              short: "Computer Skill",
              durationMins: 60,
              totalQuestions: 5,
              difficulty: "Easy-Medium",
              marksPerQuestion: 1,
              negativeMarking: 0,
              tests: [
                { id: "comp-skill-1", title: "Windows & MS Office objective practice", isFree: true }
              ]
            }
          ]
        };
        const mergedBase = mergeWithLocalExams(baseMocks);
        setExamsData(mergedBase);
        localStorage.setItem("kalinga_custom_exams_db", JSON.stringify(mergedBase));
      }
    };
    fetchExams();
  }, []);

  // Cycle notification ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlertIdx((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  // Auth Handlers
  const handleLoginSuccess = (name: string, examTarget: string, district: string, mobile: string) => {
    // Read cached profile or guest history if applicable
    const isGuestUser = name.includes("Guest") || name === "Guest Aspirant" || name === "Guest Scholar";
    const userEmail = `${name.toLowerCase().replace(/\s/g, "")}@odishaedu.in`;
    const uid = auth.currentUser?.uid;
    const cacheKey = isGuestUser 
      ? "kalinga_user_guest" 
      : `kalinga_user_${uid || "local_" + userEmail.replace(/[@.]/g, "_")}`;
    
    const cached = localStorage.getItem(cacheKey);
    let cachedData: any = null;
    if (cached) {
      try {
        cachedData = JSON.parse(cached);
      } catch (e) {}
    }

    const freshProfile: UserProfile = {
      name,
      email: `${name.toLowerCase().replace(/\s/g, "")}@odishaedu.in`,
      mobile,
      examTarget,
      district,
      coins: cachedData?.coins !== undefined ? cachedData.coins : 100,
      xp: cachedData?.xp !== undefined ? cachedData.xp : 250,
      streak: cachedData?.streak !== undefined ? cachedData.streak : 4,
      badges: (Array.isArray(cachedData?.badges) && cachedData.badges.length > 0) ? cachedData.badges : [
        { id: "b-onboarding", title: "Biju Shravak", description: "Registered profile successfully on platform", icon: "GraduationCap", unlockedAt: new Date().toLocaleDateString() }
      ],
      savedNotes: cachedData?.savedNotes || [],
      testHistory: cachedData?.testHistory || [],
      isGuest: isGuestUser
    };
    setUserProfile(freshProfile);
    setAppState("dashboard");
    setActiveTab("home");
  };

  const handleClaimDailyReward = () => {
    if (!userProfile) return;
    setUserProfile((prev) => {
      if (!prev) return null;
      // update coins & xp
      alert("✨ Excellent! Daily Reward claimed: +20 Coins, +50 XP, Streak increased by 1!");
      return {
        ...prev,
        coins: prev.coins + 20,
        xp: prev.xp + 50,
        streak: prev.streak + 1
      };
    });
  };

  const handleStartTest = async (testId: string) => {
    if (!userProfile || userProfile.isGuest) {
      setAppState("auth");
      alert("🔐 Sign In or Sign Up Required!\n\nPlease sign in or create a student account before sitting for any mock exams, in order to store your custom progress, exam answers, and historic exam scorecard data safely.");
      return;
    }

    try {
      let questionsData: any = null;
      try {
        const response = await fetch(`/api/test-questions/${testId}`);
        if (response.ok) {
          questionsData = await response.json();
        }
      } catch (fErr) {
        console.warn("Backend mock questions fetching failed, accessing browser offline copy...", fErr);
      }

      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        const cachedQ = localStorage.getItem(`kalinga_custom_questions_${testId}`);
        if (cachedQ) {
          try {
            questionsData = JSON.parse(cachedQ);
            console.log(`🟢 Loaded test questions for "${testId}" successfully from browser local mirror cache.`);
          } catch (pErr) {
            console.error("Failed to parse local stored questions:", pErr);
          }
        }
      }

      if (!questionsData) {
        throw new Error("No exam sheet questions available in either local store or server memory.");
      }

      // Find the exam duration and marking stats from list
      let matchedExam = examsData.board?.find((e) => e.tests.some((t) => t.id === testId))
                     || examsData.teaching?.find((e) => e.tests.some((t) => t.id === testId))
                     || examsData.competitive?.find((e) => e.tests.some((t) => t.id === testId))
                     || examsData.others?.find((e) => e.tests.some((t) => t.id === testId));

      if (!matchedExam) {
        // Fallback matching by prefix (e.g. "opsc-ocs" or "cbse" or "otet")
        const allExams = [
          ...(examsData.board || []),
          ...(examsData.teaching || []),
          ...(examsData.competitive || []),
          ...(examsData.others || [])
        ];
        matchedExam = allExams.find(e => testId.startsWith(e.id) || testId.startsWith(e.subCategory || ""));
      }

      // Parse a beautiful professional title
      let examTitle = testId.toUpperCase() + " Series Mock";
      if (matchedExam) {
        const match = testId.match(/mock-(\d+)/i);
        const testNum = match ? match[1] : "";
        let subTitle = "";
        if (testId.includes("mth") || testId.includes("math")) subTitle = "Mathematics";
        else if (testId.includes("sci") || testId.includes("phy") || testId.includes("pcm") || testId.includes("cbz")) subTitle = "Science";
        else if (testId.includes("arts") || testId.includes("sanskrit") || testId.includes("hindi") || testId.includes("odia")) subTitle = "Arts & Languages";
        else if (testId.includes("pet")) subTitle = "Physical Education";
        
        examTitle = `${matchedExam.short} ${subTitle ? `- ${subTitle} ` : ""}- Mock Test ${testNum || "Set"}`;
      }

      setScorecard(null); // Clear previous results
      setActiveTest({
        id: testId,
        title: examTitle,
        questions: questionsData,
        durationMins: matchedExam?.durationMins || 90,
        negativeMarking: matchedExam?.negativeMarking || 0.25,
        marksPerQuestion: matchedExam?.marksPerQuestion || 1
      });
    } catch (err) {
      console.error("Failed to fetch mock test:", err);
      alert("Uh-oh! Unable to query questions right now. Running fallback.");
    }
  };

  const handleFinishTest = (attemptData : {
    correct: number;
    wrong: number;
    totalQuestions: number;
    timeSpent: number;
    answersList: Record<string, number>;
  }) => {
    if (!activeTest) return;

    const currentNegative = activeTest.negativeMarking !== undefined ? activeTest.negativeMarking : 0.25;
    const currentMarks = activeTest.marksPerQuestion !== undefined ? activeTest.marksPerQuestion : 1;

    const newScorecard = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      correct: attemptData.correct,
      wrong: attemptData.wrong,
      totalQuestions: attemptData.totalQuestions,
      timeSpent: attemptData.timeSpent,
      negativeMarking: currentNegative,
      marksPerQuestion: currentMarks
    };

    setScorecard(newScorecard);
    setActiveTest(null); // close exam view

    // Update user stats (calculate points & xp rewards)
    if (userProfile) {
      // Calculate scaled xp rewards properly
      const pointGained = attemptData.correct * 50 - (currentNegative > 0 ? attemptData.wrong * 10 : 0);
      setUserProfile((prev) => {
        if (!prev) return null;
        const freshHistoryObj = {
          id: `att-${Date.now()}`,
          testId: newScorecard.testId,
          testTitle: newScorecard.testTitle,
          marks: attemptData.correct * currentMarks - attemptData.wrong * currentNegative,
          totalMarks: attemptData.totalQuestions * currentMarks,
          correct: attemptData.correct,
          wrong: attemptData.wrong,
          accuracy: Math.round((attemptData.correct / (attemptData.correct + attemptData.wrong || 1)) * 100),
          timeSpent: attemptData.timeSpent,
          attemptedAt: new Date().toLocaleDateString()
        };

        return {
          ...prev,
          xp: prev.xp + Math.max(50, pointGained),
          coins: prev.coins + 30, // reward coins for sitting through screening
          testHistory: [freshHistoryObj, ...prev.testHistory]
        };
      });
    }
  };

  const handleClaimBadge = (badgeId: string, title :string, desc: string, icon: string) => {
    if (!userProfile) return;
    setUserProfile((prev) => {
      if (!prev) return null;
      // prevent duplicates
      if (prev.badges.some((b) => b.id === badgeId)) {
        alert("Verification check: You have already unlocked and claimed this digital certificate.");
        return prev;
      }
      alert(`🎉 Congratulations! You have unlocked the trophy badge: [${title}] for outstanding performance! Printable scorecard generated!`);
      return {
        ...prev,
        badges: [
          ...prev.badges,
          { id: badgeId, title, description: desc, icon, unlockedAt: new Date().toLocaleDateString() }
        ]
      };
    });
  };

  const handleSaveNote = (title: string, content: string) => {
    if (!userProfile) return;
    const newNote: SavedNote = {
      id: `note-${Date.now()}`,
      title,
      content,
      date: new Date().toLocaleDateString()
    };
    setUserProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        savedNotes: [newNote, ...prev.savedNotes]
      };
    });
    alert("Subject note drafted successfully into local revision notebook!");
  };

  const handleDeleteNote = (noteId: string) => {
    if (!userProfile) return;
    setUserProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        savedNotes: prev.savedNotes.filter((n) => n.id !== noteId)
      };
    });
  };

  const handleStartOnboardingMode = (mode: "login" | "guest") => {
    if (mode === "guest") {
      // Login inside standard guest parameters
      handleLoginSuccess("Guest Aspirant", "osssc-ri", "Khordha", "9999999999");
    } else {
      setAppState("auth");
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failure:", err);
    }
    
    // Fallback gracefully to the previously saved Guest Scholar profile, retaining progress
    const cachedGuest = localStorage.getItem("kalinga_user_guest");
    let guestProfile = {
      name: "Guest Scholar 🔓",
      email: "guest@odishaedu.in",
      mobile: "9437011223",
      examTarget: "cbse",
      district: "Khordha",
      coins: 100,
      xp: 155,
      streak: 3,
      badges: [],
      savedNotes: [],
      testHistory: [],
      isGuest: true
    };
    if (cachedGuest) {
      try {
        guestProfile = JSON.parse(cachedGuest);
      } catch (e) {
        console.error("Failed to parse cached guest profile on logout:", e);
      }
    }
    setUserProfile(guestProfile);
    setAppState("dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-orange-500 selection:text-white" id="main-app-shell">
      {/* -------------------- LOADER FOR INITIAL SESSION RESOLVING -------------------- */}
      <AnimatePresence>
        {authLoading && (
          <motion.div
            key="initial-app-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#1e3a8a] text-white p-6"
          >
            {/* Ambient decorative glowing spots */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }}></div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center space-y-6 max-w-sm w-full relative z-10"
            >
              {/* Outer circular indicator */}
              <div className="relative">
                <div className="w-20 h-20 border-[3.5px] border-slate-800 rounded-full"></div>
                <motion.div 
                  className="absolute inset-0 w-20 h-20 border-[3.5px] border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-orange-400 stroke-[2.2] animate-bounce" />
                </div>
              </div>

              {/* Text info and gorgeous status list */}
              <div className="text-center space-y-2">
                <motion.h1 
                  initial={{ letterSpacing: "0.1em" }}
                  animate={{ letterSpacing: "0.25em" }}
                  transition={{ duration: 0.8 }}
                  className="font-black text-base tracking-widest text-slate-50 uppercase font-mono"
                >
                  ODISHA EXAM
                </motion.h1>
                <p className="text-[10px] text-amber-500 font-black tracking-wider uppercase flex items-center justify-center gap-1">
                  Education For Progress 🎓
                </p>
                <p className="text-[11px] text-slate-405 font-semibold max-w-xs mx-auto leading-relaxed text-slate-350">
                  Jai Jagannath! Initializing Odisha's premier smart computer based test (CBT) portal.
                </p>
              </div>

              {/* Visual mini status steps with active toggling */}
              <div className="w-full max-w-xs bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 space-y-2.5 font-mono text-[10px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {loadingStep >= 0 ? "🟢" : "⏳"} Local DB Cache
                  </span>
                  <span className={loadingStep >= 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {loadingStep >= 0 ? "Ready ✓" : "Verifying"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {loadingStep >= 1 ? "🟢" : "⏳"} State CBT Syllabus
                  </span>
                  <span className={loadingStep >= 1 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {loadingStep >= 1 ? "Aligned ✓" : "Connecting"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {loadingStep >= 2 ? "🟢" : "⏳"} Direct Sync Gateways
                  </span>
                  <span className={loadingStep >= 2 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {loadingStep >= 2 ? "Linked ✓" : "Connecting"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {loadingStep >= 3 ? "🟢" : "⏳"} Anti-Cheating Engine
                  </span>
                  <span className={loadingStep >= 3 ? "text-amber-400 font-bold animate-pulse" : "text-slate-500"}>
                    {loadingStep >= 3 ? "Active 🛡️" : "Deploying"}
                  </span>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 font-mono tracking-widest font-black uppercase text-center shrink-0">
                ⚡ SECURE LEVEL INTERCONNECT ⚡
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------- UN-AUTHENTICATED PREVIEWS -------------------- */}

      {!authLoading && appState === "landing" && (
        (() => {
          setTimeout(() => setAppState("dashboard"), 0);
          return null;
        })()
      )}

      {!authLoading && appState === "auth" && (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onExit={() => setAppState("dashboard")}
        />
      )}

      {/* -------------------- RUNNING MOCK TEST CBT MODE -------------------- */}
      {activeTest && (
        <MockTestInterface
          testId={activeTest.id}
          testTitle={activeTest.title}
          questions={activeTest.questions}
          durationMins={activeTest.durationMins}
          negativeMarking={activeTest.negativeMarking}
          marksPerQuestion={activeTest.marksPerQuestion}
          onFinishTest={handleFinishTest}
          onExit={() => setActiveTest(null)}
        />
      )}

      {/* -------------------- COMPLETED RESULT BLUEPRINTS -------------------- */}
      {scorecard && !activeTest && (
        <div className="flex-1 bg-slate-50 py-10 px-4 md:px-6">
          <ResultAnalytics
            testId={scorecard.testId}
            testTitle={scorecard.testTitle}
            correct={scorecard.correct}
            wrong={scorecard.wrong}
            totalQuestions={scorecard.totalQuestions}
            timeSpent={scorecard.timeSpent}
            negativeMarking={scorecard.negativeMarking}
            marksPerQuestion={scorecard.marksPerQuestion}
            onRestart={() => handleStartTest(scorecard.testId)}
            onNavigateHome={() => {
              setScorecard(null);
              setActiveTab("home");
            }}
            onClaimBadge={handleClaimBadge}
            userName={userProfile?.name || "Guest Scholar 🔓"}
            userDistrict={userProfile?.district || "Khordha"}
          />
        </div>
      )}

      {/* -------------------- MAIN SECURE ASPIRANTS PANEL -------------------- */}
      {appState === "dashboard" && !activeTest && !scorecard && userProfile && (
        <div className="flex-grow flex flex-col lg:flex-row" id="dashboard-wrapper">
          {/* A. Sleek Sidebar for desktop screens */}
          <aside className="hidden lg:flex w-64 bg-[#1e3a8a] text-white flex-col shrink-0 border-r border-blue-950 p-5 sticky top-0 h-screen justify-between">
            <div className="space-y-8">
              {/* Logo block */}
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500 p-2 rounded-xl text-slate-950 flex items-center justify-center shadow-md">
                  <GraduationCap className="h-6 w-6 stroke-[3]" />
                </div>
                <div>
                  <h1 className="font-extrabold text-sm tracking-widest leading-none block">ODISHA EXAM</h1>
                  <span className="text-[9px] uppercase font-bold text-amber-300">Selection Portal</span>
                </div>
              </div>

              {/* District locator badge */}
              <div className="bg-white/10 p-3 rounded-xl border border-white/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="truncate block font-bold text-slate-200">{userProfile.district}</span>
                </div>
                <span className="text-[10px] bg-orange-500 text-slate-950 px-2 py-0.5 rounded font-mono font-black shrink-0">
                  RANK #{userProfile.xp > 500 ? 5 : userProfile.xp > 300 ? 18 : 41}
                </span>
              </div>

              {/* Navigation lists */}
              <nav className="space-y-1.5 text-xs font-bold text-slate-300">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    activeTab === "home" ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-4 w-5 shrink-0" /> Mock Test Center
                </button>

                <button
                  onClick={() => setActiveTab("ai-advisor")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    activeTab === "ai-advisor" ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-4 w-5 shrink-0 text-amber-300 fill-amber-300/40" /> Prerana AI Doubts
                </button>

                <button
                  onClick={() => setActiveTab("leaderboards")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all relative ${
                    activeTab === "leaderboards" ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Trophy className="h-4 w-5 shrink-0" /> Merit Leaderboard
                </button>

                <button
                  onClick={() => setActiveTab("admin-portal")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all relative ${
                    activeTab === "admin-portal" ? "bg-rose-700 text-white shadow-md shadow-rose-700/10" : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ShieldAlert className="h-4.5 w-5 shrink-0 text-rose-300" /> Admin Console
                </button>
              </nav>
            </div>

            <div className="space-y-4">
              {/* Preparation level meter */}
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between text-[10px] font-bold mb-1.5 text-blue-200">
                  <span>Odisha General Syllabus Gauge</span>
                  <span className="text-orange-400 font-black">72%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: "72%" }}></div>
                </div>
              </div>

              {/* Logout or Login button bottom dynamically */}
              {userProfile.isGuest ? (
                <button
                  onClick={() => setAppState("auth")}
                  className="px-4 py-3 w-full bg-orange-500 hover:bg-orange-650 text-slate-955 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-orange-400"
                >
                  🔐 Login / SignUp
                </button>
              ) : (
                <button
                  onClick={handleLogOut}
                  className="px-4 py-3 w-full bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="h-4.5 w-4.5" /> Logout Session
                </button>
              )}
            </div>
          </aside>

          {/* B. Sleek Header Bar & Layout for mobile/tablet screens */}
          <div className="flex-1 flex flex-col min-w-0" id="main-content-canvas">
            {/* Top Navigation Row */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between" id="dashboard-navbar">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle burger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                  aria-label="Toggle Main Navigation Menu"
                  id="navbar-menu-toggle-btn"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Breadcrumb banner */}
                <div>
                  <h2 className="font-extrabold text-blue-950 text-sm md:text-base leading-none">
                    {activeTab === "home"
                      ? "Aspirant Mock Centre"
                      : activeTab === "ai-advisor"
                        ? "Prerana AI Desk"
                        : activeTab === "admin-portal"
                          ? "Administration Console"
                          : "Odisha Toppers Grid"}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                    {userProfile.isGuest ? (
                      <span>Platform Mode: <strong className="text-amber-600 font-black">Guest Account 🔓</strong></span>
                    ) : (
                      <span>Logged in as: <strong className="text-slate-700">{userProfile.name}</strong></span>
                    )}
                  </span>
                </div>
              </div>

              {/* Dynamic Notification Slider ticker inside Header bar */}
              <div className="hidden md:flex flex-grow max-w-sm mx-6 bg-orange-50/50 border border-orange-100 rounded-xl px-3.5 py-1.5 items-center gap-2 text-[10px] text-orange-900 leading-tight">
                <Bell className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span className="truncate font-semibold">{alerts[activeAlertIdx]}</span>
              </div>

              {/* User badge display top-right */}
              <div className="flex items-center gap-3">
                {userProfile.isGuest && (
                  <button
                    onClick={() => setAppState("auth")}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1 border border-orange-400"
                  >
                    🔐 Login / SignUp
                  </button>
                )}

                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live: 4,281
                </span>

                <div className="bg-slate-100 h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-bold leading-tight flex items-center gap-1.5 text-slate-600 font-mono">
                  <Flame className="h-4 w-4 text-orange-500 fill-orange-500 shrink-0" />
                  <span>{userProfile.streak}d</span>
                </div>
              </div>
            </header>

            {/* Mobile Sidebar overlay list drawer if open */}
            {mobileMenuOpen && (
              <div className="lg:hidden bg-[#1e3a8a] text-white p-6 space-y-6 border-b border-blue-950 relative z-20">
                <nav className="space-y-1 my-2 flex flex-col text-xs font-bold">
                  <button
                    onClick={() => {
                      setActiveTab("home");
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg ${activeTab === "home" ? "bg-orange-500" : "hover:bg-white/10"}`}
                  >
                    📓 Mock MCQ Tests
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("ai-advisor");
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg ${activeTab === "ai-advisor" ? "bg-orange-500" : "hover:bg-white/10"}`}
                  >
                    ✨ Prerana AI Doubts
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("leaderboards");
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg ${activeTab === "leaderboards" ? "bg-orange-500" : "hover:bg-white/10"}`}
                  >
                    🏆 Merit Leaderboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("admin-portal");
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg ${activeTab === "admin-portal" ? "bg-rose-700 text-white font-bold" : "hover:bg-white/10 text-orange-200"}`}
                  >
                    ⚙️ Admin Console
                  </button>
                </nav>

                {userProfile.isGuest ? (
                  <button
                    onClick={() => {
                      setAppState("auth");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-605 text-slate-950 font-black text-xs rounded-xl shadow-md border border-orange-400"
                  >
                    🔐 Login / SignUp
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLogOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-red-650/35 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                  >
                    Logout Session
                  </button>
                )}
              </div>
            )}

            {/* C. Primary Interactive canvas wrapper */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
              {activeTab === "home" && (
                <StudentDashboard
                  userProfile={userProfile}
                  exams={examsData}
                  onStartTest={handleStartTest}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onClaimDailyReward={handleClaimDailyReward}
                />
              )}

              {activeTab === "ai-advisor" && (
                <AIDoubtSolver userExamTarget={userProfile.examTarget} />
              )}

              {activeTab === "leaderboards" && (
                <LeaderboardSection />
              )}

              {activeTab === "admin-portal" && (
                <AdminPanel 
                  exams={examsData}
                  onReloadExams={async () => {
                    try {
                      const response = await fetch("/api/exams-data");
                      if (response.ok) {
                        const data = await response.json();
                        const merged = mergeWithLocalExams(data);
                        setExamsData(merged);
                        localStorage.setItem("kalinga_custom_exams_db", JSON.stringify(merged));
                      }
                    } catch (e) {
                      console.error("Failed to reload dynamic exams database:", e);
                    }
                  }}
                />
              )}
            </main>

            {/* Sleek bottom navigation for mobile viewport */}
            <div className="lg:hidden sticky bottom-0 bg-white border-t border-slate-150 p-2 text-center grid grid-cols-3 z-40 shadow-lg">
              <button
                onClick={() => setActiveTab("home")}
                className={`py-1 flex flex-col items-center justify-center text-[9px] font-bold ${
                  activeTab === "home" ? "text-orange-500 font-extrabold" : "text-slate-400"
                }`}
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span className="mt-0.5">Mock Mocks</span>
              </button>

              <button
                onClick={() => setActiveTab("ai-advisor")}
                className={`py-1 flex flex-col items-center justify-center text-[9px] font-bold ${
                  activeTab === "ai-advisor" ? "text-orange-500 font-extrabold animate-pulse" : "text-slate-400"
                }`}
              >
                <Sparkles className="h-4.5 w-4.5 text-indigo-700 fill-indigo-200" />
                <span className="mt-0.5 font-bold">Ask AI</span>
              </button>

              <button
                onClick={() => setActiveTab("leaderboards")}
                className={`py-1 flex flex-col items-center justify-center text-[9px] font-bold ${
                  activeTab === "leaderboards" ? "text-orange-500 font-extrabold" : "text-slate-400"
                }`}
              >
                <Trophy className="h-4.5 w-4.5" />
                <span className="mt-0.5 font-bold">Toppers</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
