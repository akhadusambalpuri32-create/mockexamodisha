import React, { useState, useEffect } from "react";
import { Question } from "../types";
import { AlertTriangle, Clock, HelpCircle, ShieldAlert, CheckCircle, Languages, AlertCircle, BookOpen, Sparkles, X } from "lucide-react";

interface MockTestInterfaceProps {
  testId: string;
  testTitle: string;
  questions: Question[];
  durationMins: number;
  negativeMarking: number;
  marksPerQuestion: number;
  onFinishTest: (attemptData: {
    correct: number;
    wrong: number;
    totalQuestions: number;
    timeSpent: number;
    answersList: Record<string, number>;
  }) => void;
  onExit: () => void;
}

export default function MockTestInterface({
  testId,
  testTitle,
  questions,
  durationMins,
  negativeMarking,
  marksPerQuestion,
  onFinishTest,
  onExit
}: MockTestInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // qId -> optionIdx
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({}); // qId -> Boolean
  const [visited, setVisited] = useState<Record<string, boolean>>({ [questions[0]?.id]: true });
  const [language, setLanguage] = useState<"EN" | "OR">("EN"); // English vs Odia UI/Translators

  // Unseen passage layout and reading states
  const [passageFontSize, setPassageFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [mobilePassageTab, setMobilePassageTab] = useState<"passage" | "qa">("passage");
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(durationMins * 60);
  const [timeSpent, setTimeSpent] = useState(0);

  // Anti-cheat warnings count
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);

  // Listen to focus changes (Anti-cheating)
  useEffect(() => {
    const handleBlur = () => {
      setCheatWarnings((prev) => {
        const updated = prev + 1;
        setShowCheatModal(true);
        return updated;
      });
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Countdown countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Reset mobile passage tab to "passage" when switching to a new question if it contains a passage
  useEffect(() => {
    if (questions[currentIdx]?.passage) {
      setMobilePassageTab("passage");
    }
  }, [currentIdx, questions]);

  // Format countdown text helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIdx];

  // Palette Status helper
  const getQStatus = (qId: string, idx: number) => {
    const isAns = answers[qId] !== undefined;
    const isMarked = markedForReview[qId];
    const isVis = visited[qId];

    if (isMarked) return "bg-orange-500 text-white"; // Review Priority
    if (isAns) return "bg-emerald-600 text-white"; // Answered Saved
    if (isVis) return "bg-red-500 text-white"; // Visited but no decision yet
    return "bg-slate-100 text-slate-800 border border-slate-200"; // Fresh
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentQ.id]: optIdx });
  };

  const handleMarkReview = () => {
    setMarkedForReview({ ...markedForReview, [currentQ.id]: true });
    handleNext();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      const nextQ = questions[nextIdx];
      setVisited({ ...visited, [nextQ.id]: true });
      setCurrentIdx(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleClear = () => {
    const updatedAns = { ...answers };
    delete updatedAns[currentQ.id];
    setAnswers(updatedAns);

    const updatedReview = { ...markedForReview };
    delete updatedReview[currentQ.id];
    setMarkedForReview(updatedReview);
  };

  const handleSubmit = () => {
    let corrCount = 0;
    let wrongCount = 0;

    questions.forEach((q) => {
      const answeredOpt = answers[q.id];
      if (answeredOpt !== undefined) {
        if (answeredOpt === q.correctIndex) {
          corrCount += 1;
        } else {
          wrongCount += 1;
        }
      }
    });

    onFinishTest({
      correct: corrCount,
      wrong: wrongCount,
      totalQuestions: questions.length,
      timeSpent: timeSpent,
      answersList: answers
    });
  };

  // Safe manual translations map to local Odia content
  const getBilingualQuestion = () => {
    if (language === "EN") return currentQ.question;
    // Simple custom fallback translations for questions:
    if (currentQ.id === "ocs-q1") {
      return "ନ୍ଦେ ଉତ୍କଳ ଜନନୀ’ ଯିଏକି ଓଡ଼ିଶାର ସରକାରୀ ରାଜ୍ୟ ସଙ୍ଗୀତ ଅଟେ, ଏହାକୁ କେଉଁ କବି ରଚନା କରିଥିଲେ?";
    }
    if (currentQ.id === "ocs-q2") {
      return "କଳିଙ୍ଗ ଯୁଦ୍ଧ ଓଡ଼ିଶାର କେଉଁ ନଦୀ କୂଳରେ ଲଢା ଯାଇଥିଲା?";
    }
    if (currentQ.id === "ocs-q3") {
      return "କଟକର ପ୍ରସିଦ୍ଧ 'ବାଲିଯାତ୍ରା' କେଉଁ ମସିହାରେ ଜାତୀୟ ସାମୁଦ୍ରିକ ଐତିହ୍ୟ ମାନ୍ୟତା ଲାଭ କଲା?";
    }
    if (currentQ.id === "ocs-q4") {
      return "ନିମ୍ନଲିଖିତ ବାକ୍ୟର ସଠିକ୍ ଓଡ଼ିଆ ଅନୁବାଦ ଚୟନ କରନ୍ତୁ: 'Sincerity and hard work are the keys to crack competitive examinations.'";
    }
    if (currentQ.id === "ocs-q5") {
      return "ଓଡ଼ିଶାରେ ଥିବା ନିମ୍ନଲିଖିତ ଜଳଭୂମିଗୁଡ଼ିକ ମଧ୍ୟରୁ କେଉଁଟି ରାମସାର୍ କନଭେନସନ ଅଧୀନରେ ତାଲିକାଭୁକ୍ତ ଏବଂ ଓଡ଼ିଶାର ସର୍ବବୃହତ ହ୍ରଦ?";
    }
    if (currentQ.id === "ri-q1") {
      return "ନୟାଗଡ଼ର ଏକ ଗ୍ରାମ୍ୟ ଭୂମି ର କ୍ଷେତ୍ରଫଳ ୪୮୦ ବର୍ଗ ମିଟର। ଯଦି ଏହାର ଲମ୍ବ ୨୪ ମିଟର ହୁଏ, ତେବେ ଏହାର ପରିସୀମା କେତେ?";
    }
    if (currentQ.id === "ri-q2") {
      return "୧୮୧୭ ମସିହାରେ ଖୋର୍ଦ୍ଧାରେ ହୋଇଥିବା ପ୍ରସିଦ୍ଧ 'ପାଇକ ବିଦ୍ରୋହ' ର ନେତା କିଏ ଥିଲେ?";
    }
    if (currentQ.id === "ri-q3") {
      return "କମ୍ପ୍ୟୁଟର ବିଜ୍ଞାନରେ, 'BIOS' ମଧ୍ୟରେ 'O' ର ପୂରା ଅର୍ଥ କଣ?";
    }
    return currentQ.question;
  };

  const getBilingualOption = (optionStr: string, optIdx: number) => {
    if (language === "EN") return optionStr;
    // Mapped Odia options
    if (currentQ.id === "ocs-q1") {
      const trans = ["ରାଧାନାଥ ରାୟ", "ଲକ୍ଷ୍ମୀକାନ୍ତ ମହାପାତ୍ର", "ମଧୁସୂଦନ ରାଓ", "ଗଙ୍ଗାଧର ମେହେର"];
      return trans[optIdx] || optionStr;
    }
    if (currentQ.id === "ocs-q2") {
      const trans = ["ମହାନଦୀ", "ବୈତରଣୀ", "ଦୟା ନଦୀ", "ବ୍ରାହ୍ମଣୀ"];
      return trans[optIdx] || optionStr;
    }
    if (currentQ.id === "ocs-q3") {
      const trans = ["୨୦୧୮", "୨୦୨୦", "୨୦୨୨", "୨୦୨୪"];
      return trans[optIdx] || optionStr;
    }
    if (currentQ.id === "ocs-q5") {
      const trans = ["ଅଂଶୁପା ହ୍ରଦ", "ଚିଲିକା ହ୍ରଦ", "ଭିତରକନିକା", "ହୀରାକୁଦ"];
      return trans[optIdx] || optionStr;
    }
    if (currentQ.id === "ri-q2") {
      const trans = ["ସୁରେନ୍ଦ୍ର ସାଏ", "ବକ୍ସି ଜଗବନ୍ଧୁ", "ଚକ୍ର ବିଷୋୟୀ", "ଧରଣୀଧର"];
      return trans[optIdx] || optionStr;
    }
    if (currentQ.id === "ri-q3") {
      const trans = ["ଅନଲାଇନ୍", "ଆଉଟପୁଟ୍", "ଅବଜେକ୍ଟ", "ଅପରେସନ୍"];
      return trans[optIdx] || optionStr;
    }
    return optionStr;
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-12 font-sans" id="test-system-wrapper">
      {/* ⚠️ Severe Anti-cheat Alert Warning Banner if user focus is lost */}
      {showCheatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-red-500 animate-bounce">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <ShieldAlert className="h-8 w-8 shrink-0" />
              <h4 className="font-extrabold text-lg">PROCTORED EXAM WARNING</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Detection log: **Secure Exam Interface Focus Lost**. You have shifted windows/tabs. This system simulates formal OSSSC/OPSC screening anti-cheat algorithms.
            </p>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl mb-4 text-xs font-bold text-red-700">
              <span>Total Violations: {cheatWarnings} / 3 Allowed</span>
              <span>Status: {cheatWarnings >= 3 ? "BANNED (DEMO)" : "ACTIVE"}</span>
            </div>
            <button
              onClick={() => setShowCheatModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl"
            >
              Understand & Return to Test Screen
            </button>
          </div>
        </div>
      )}

      {/* Top Proctored Header */}
      <header className="bg-blue-900 text-white px-6 py-4 sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-950">
        <div>
          <span className="text-[9px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-widest mr-2 inline-block">
            Online Proctored Mode
          </span>
          <h1 className="font-black text-sm sm:text-base inline-block">{testTitle}</h1>
        </div>

        {/* Dynamic Dual Language Switch & Terminate action */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === "EN" ? "OR" : "EN")}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/15"
          >
            <Languages className="h-3.5 w-3.5 text-amber-300" />
            Language: <span className="text-amber-300 font-mono font-black">{language === "EN" ? "ENGLISH" : "ଓଡ଼ିଆ"}</span>
          </button>

          <button
            onClick={onExit}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors border border-red-700"
          >
            Abort Test
          </button>
        </div>
      </header>

      {/* Main double column structure */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid lg:grid-cols-12 gap-6">
        {/* Left Column: Question Presentation Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs relative">
            {currentQ?.passage ? (
              <div className="flex flex-col gap-4">
                {/* Mobile Tab Swapper (only visible on mobile layout) */}
                <div className="flex md:hidden bg-slate-100 p-1 rounded-xl mb-2" id="mobile-passage-tabs">
                  <button
                    onClick={() => setMobilePassageTab("passage")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      mobilePassageTab === "passage" ? "bg-white text-blue-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    📖 Read Passage
                  </button>
                  <button
                    onClick={() => setMobilePassageTab("qa")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      mobilePassageTab === "qa" ? "bg-white text-blue-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ✍️ Solve MCQ ({currentIdx + 1})
                  </button>
                </div>

                {/* Main responsive grid area */}
                <div className="grid md:grid-cols-2 gap-6" id="passage-split-grid">
                  {/* LEFT PANE: Passage Desk (visible on MD scale, or on Mobile if active tab is "passage") */}
                  <div className={`flex flex-col gap-3 ${mobilePassageTab === "passage" ? "block" : "hidden md:flex"}`}>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-blue-800" />
                        UNSEEN PASSAGE
                      </span>

                      {/* Controls toolbar */}
                      <div className="flex items-center gap-2">
                        {/* Font Resizing */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            title="Decrease text size"
                            onClick={() => {
                              if (passageFontSize === "xl") setPassageFontSize("lg");
                              else if (passageFontSize === "lg") setPassageFontSize("base");
                              else if (passageFontSize === "base") setPassageFontSize("sm");
                            }}
                            className="px-2 py-1 text-[10px] hover:bg-slate-100 font-bold border-r border-slate-200 text-slate-600"
                          >
                            A-
                          </button>
                          <button
                            title="Increase text size"
                            onClick={() => {
                              if (passageFontSize === "sm") setPassageFontSize("base");
                              else if (passageFontSize === "base") setPassageFontSize("lg");
                              else if (passageFontSize === "lg") setPassageFontSize("xl");
                            }}
                            className="px-2 py-1 text-[10px] hover:bg-slate-100 font-bold text-slate-600"
                          >
                            A+
                          </button>
                        </div>

                        {/* Full view trigger */}
                        <button
                          onClick={() => setIsPassageModalOpen(true)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] text-amber-800 font-black rounded-lg flex items-center gap-1 transition-all uppercase cursor-pointer"
                          title="Open in Full Read View"
                        >
                          <Sparkles className="h-3 w-3 text-amber-500 animate-spin-slow" />
                          <span>Full View</span>
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Passage backplate */}
                    <div 
                      className={`overflow-y-auto max-h-[360px] md:max-h-[460px] p-4 rounded-xl bg-amber-50/40 border border-amber-100/70 shadow-inner leading-relaxed transition-all scrollbar-thin ${
                        passageFontSize === "sm" ? "text-xs" :
                        passageFontSize === "lg" ? "text-base md:text-md" :
                        passageFontSize === "xl" ? "text-lg md:text-xl font-medium" : "text-sm md:text-base"
                      }`}
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {currentQ.passage.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx} className="mb-4 text-justify text-slate-800 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>

                    <p className="text-[9px] text-slate-400 font-bold italic">
                      💡 Tip: Click "Full View" for distractions-free widescreen study layout.
                    </p>
                  </div>

                  {/* RIGHT PANE: MCQ Question & Options (visible on MD scale, or on Mobile if active tab is "qa") */}
                  <div className={`flex flex-col gap-4 ${mobilePassageTab === "qa" ? "block" : "hidden md:block"}`}>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-xs font-extrabold text-blue-900 font-mono">
                        QUESTION {currentIdx + 1} OF {questions.length}
                      </span>
                      <div className="flex gap-3 text-[11px] text-slate-500">
                        <span>Subject: <strong className="text-slate-705">{currentQ?.subject}</strong></span>
                        <span>Marks: <strong className="text-emerald-600">+{marksPerQuestion}</strong></span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base mb-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      {getBilingualQuestion()}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-2.5">
                      {currentQ?.options.map((option, oIdx) => {
                        const isSelected = answers[currentQ.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(oIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/50 text-blue-900 outline-2 outline-blue-500/20 shadow-xs"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700 bg-white"
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className={`h-5.5 w-5.5 rounded-full border text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-blue-500 text-white border-blue-500" : "border-slate-300 text-slate-500 bg-white"
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{getBilingualOption(option, oIdx)}</span>
                            </span>
                            {isSelected && <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Traditional single question rendering when no passage is present
              <>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <span className="text-xs font-extrabold text-blue-900 font-mono">
                    QUESTION {currentIdx + 1} OF {questions.length}
                  </span>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Subject: <strong className="text-slate-800">{currentQ?.subject}</strong></span>
                    <span>Marks: <strong className="text-emerald-600">+{marksPerQuestion}</strong> / <strong className="text-red-500">-{negativeMarking}</strong></span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="font-extrabold text-slate-900 text-base md:text-lg mb-6 leading-relaxed">
                  {getBilingualQuestion()}
                </h3>

                {/* Answer Options list */}
                <div className="space-y-3">
                  {currentQ?.options.map((option, oIdx) => {
                    const isSelected = answers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 text-blue-900 outline-2 outline-blue-500/20"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-blue-500 text-white border-blue-500" : "border-slate-300 text-slate-500 bg-white"
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{getBilingualOption(option, oIdx)}</span>
                        </span>
                        {isSelected && <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Action Palette strip below question block */}
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={handlePrev}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 text-red-500 hover:bg-red-50 border border-transparent font-bold text-xs rounded-xl transition-all"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMarkReview}
                className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs rounded-xl transition-all"
              >
                Mark for Review
              </button>
              <button
                onClick={() => {
                  setVisited({ ...visited, [currentQ.id]: true });
                  if (currentIdx === questions.length - 1) {
                    // Do nothing or let user submit
                  } else {
                    handleNext();
                  }
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Skip Question
              </button>
              <button
                onClick={() => {
                  setVisited({ ...visited, [currentQ.id]: true });
                  if (currentIdx === questions.length - 1) {
                    handleSubmit();
                  } else {
                    handleNext();
                  }
                }}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {currentIdx === questions.length - 1 ? "Submit Exam" : "Save & Next"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: CBT Control Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Candidate Card & Timer countdown */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-center flex flex-col justify-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm mb-3">
              ST
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">Student ID: Aspirant_03</h4>
            <span className="text-[10px] text-slate-500 block mb-4">Exam Mode: Regular Screening</span>

            {/* Countdowns timer */}
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-2 text-red-600">
              <Clock className="h-5 w-5 animate-pulse shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-red-500 leading-none">Time Remaining</span>
                <span className="text-xl font-mono font-black">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Question Grid Map Palette */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs">
            <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-3">
              Question Palette
            </h4>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setVisited({ ...visited, [q.id]: true });
                    setCurrentIdx(idx);
                  }}
                  className={`h-9 w-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer hover:opacity-85 ${getQStatus(
                    q.id,
                    idx
                  )}`}
                >
                  {(idx + 1).toString().padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* Colors legend */}
            <div className="space-y-2 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 bg-emerald-600 rounded-sm"></span>
                <span>Answered & Saved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 bg-orange-500 rounded-sm"></span>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 bg-red-500 rounded-sm"></span>
                <span>Visited but Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 bg-slate-100 border border-slate-200 rounded-sm"></span>
                <span>Not Visited yet</span>
              </div>
            </div>
          </div>

          {/* Real Final submission button triggers */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer text-center block"
          >
            Submit Final Answers
          </button>
        </div>
      </div>

      {/* 📖 FULL SCREEN PASSAGE STUDY DECK / GOOD AND FULL VIEW */}
      {isPassageModalOpen && currentQ?.passage && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in" id="full-passage-modal">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[85vh] sm:h-[90vh]">
            {/* Header */}
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-400 text-slate-950 p-1.5 rounded-lg shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Comprehensive Reading Desk (Full Screen)</h3>
                  <span className="text-[10px] text-blue-200 block">Odisha Board exam simulation standard</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* FontSize Controller */}
                <div className="bg-white/10 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs border border-white/10 font-bold">
                  <span className="text-blue-200 text-[10px] mr-1">FONT SIZE:</span>
                  <button
                    onClick={() => {
                      if (passageFontSize === "xl") setPassageFontSize("lg");
                      else if (passageFontSize === "lg") setPassageFontSize("base");
                      else if (passageFontSize === "base") setPassageFontSize("sm");
                    }}
                    className="px-2 py-0.5 hover:bg-white/10 rounded text-[10px]"
                  >
                    A-
                  </button>
                  <span className="font-mono text-amber-300 font-extrabold uppercase text-[10px] px-1">{passageFontSize}</span>
                  <button
                    onClick={() => {
                      if (passageFontSize === "sm") setPassageFontSize("base");
                      else if (passageFontSize === "base") setPassageFontSize("lg");
                      else if (passageFontSize === "lg") setPassageFontSize("xl");
                    }}
                    className="px-2 py-0.5 hover:bg-white/10 rounded text-[10px]"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() => setIsPassageModalOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-xl transition-all text-white cursor-pointer"
                  title="Close Reader Screen"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Scrollable Reader Canvas with simulated paper backplate */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-amber-50/20 flex-1 scrollbar-thin">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6 border-b border-amber-250/50 pb-5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#a16207] bg-amber-100 px-3 py-1 rounded-full">
                    Official Screening Passage Content
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif text-slate-800 font-bold mt-3 leading-snug">
                    Synthesizing Modern Education and Dialectal Diversity in Odisha Context
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans font-bold">Recommended Reading Duration: ~3 minutes | Source: OSEPA Pedagogy Desk</p>
                </div>

                <div 
                  className={`leading-relaxed text-slate-800 space-y-4 antialiased focus:outline-none selection:bg-blue-105 ${
                    passageFontSize === "sm" ? "text-sm" :
                    passageFontSize === "lg" ? "text-lg" :
                    passageFontSize === "xl" ? "text-xl font-medium" : "text-base"
                  }`}
                  style={{ fontFamily: "Georgia, Cambria, serif" }}
                >
                  {currentQ.passage.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="text-justify leading-relaxed indent-6">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer containing quick helpful instructions */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-bold gap-2">
              <span className="flex items-center gap-1">
                💡 Hint: Scroll inside the reader frame to digest the material. When ready, click "Return to MCQ Panel".
              </span>
              <button 
                onClick={() => setIsPassageModalOpen(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm self-end"
              >
                Return to MCQ Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
