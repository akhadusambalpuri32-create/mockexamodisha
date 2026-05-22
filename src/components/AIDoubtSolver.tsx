import React, { useState } from "react";
import { Sparkles, Send, Loader2, Calendar, BookOpen, AlertCircle, RefreshCw, Volume2 } from "lucide-react";

interface AIDoubtSolverProps {
  userExamTarget: string;
}

export default function AIDoubtSolver({ userExamTarget }: AIDoubtSolverProps) {
  // Chat Doubt State
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Namaskar! I am **Prerana AI**, your personal Odisha Exam academic mentor. You can ask me doubts about Odisha history, culture, mathematics, pedagogy, syllabus, or translation details. Go ahead!" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // Study Blueprint State
  const [targetExam, setTargetExam] = useState(userExamTarget || "osssc-ri");
  const [dailyHours, setDailyHours] = useState("3");
  const [weakTopics, setWeakTopics] = useState("");
  const [studyPlanResult, setStudyPlanResult] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Voice simulation state
  const [isListening, setIsListening] = useState(false);

  // Flashcards state
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const flashcards = [
    { q: "Who was the first Chief Minister of Odisha (formerly Prime Minister of Orissa presidency)?", a: "Krushna Chandra Gajapati (May 1937 - July 1937), followed by Biswanath Das and Harekrushna Mahatab." },
    { q: "What is the historical significance of the 'Satyabadi Bakula Bana' school?", a: "Founded by Utkalamani Gopabandhu Das in 1909 near Sakhigopal, Puri, it was an open-air classroom promoting nationalist education and social reform." },
    { q: "How many members are elected to the Odisha Legislative Assembly (Vidhan Sabha)?", a: "147 members." },
    { q: "Which district in Odisha has the highest forest canopy cover percentage?", a: "Kandhamal." }
  ];

  const handleSendDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loadingChat) return;

    const userMsg = userInput;
    setUserInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoadingChat(true);

    try {
      const response = await fetch("/api/ai/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userMsg,
          examTarget: targetExam
        })
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "ai", text: "Oh! There was a network glitch. In the meantime, study hard! Ensure you have set process.env.GEMINI_API_KEY inside the secrets config workspace." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleTriggerVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setUserInput("Who built the Sun Temple of Konark?");
    }, 2000);
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName: targetExam.toUpperCase().replace("-", " "),
          targetHours: dailyHours,
          weakTopics
        })
      });
      const data = await response.json();
      setStudyPlanResult(data.text);
    } catch (err) {
      console.error(err);
      setStudyPlanResult("Error creating schedule. Please verify your internet connection.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 font-sans" id="ai-doubt-solver-root">
      {/* Left Column: AI Doubt Chatbot (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col bg-white border border-slate-150 rounded-3xl shadow-xs overflow-hidden h-[540px]">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white px-5 py-4 flex items-center justify-between border-b border-blue-920">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 bg-emerald-400 rounded-full animate-ping"></div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-amber-300" /> Prerana AI Doubts Desk
              </h3>
              <span className="text-[10px] text-blue-200">State Syllabus Academic Companion</span>
            </div>
          </div>

          <button
            onClick={() => setMessages([{ sender: "ai", text: "Namaskar! Conversation refreshed. Ask away!" }])}
            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded font-bold"
          >
            Clear Thread
          </button>
        </div>

        {/* Messaging Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === "user"
                    ? "bg-blue-900 text-white rounded-tr-none font-semibold"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                {m.sender === "ai" && (
                  <span className="block text-[8px] uppercase font-black text-amber-600 mb-1">
                    Prerana AI Mentor
                  </span>
                )}
                {/* Simulated rendering markdown headers simply */}
                <p className="whitespace-pre-wrap">
                  {m.text.split("**").map((part, pIdx) => {
                    if (pIdx % 2 === 1) return <strong key={pIdx} className="font-extrabold text-blue-950">{part}</strong>;
                    return part;
                  })}
                </p>
              </div>
            </div>
          ))}

          {loadingChat && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-205 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                <Loader2 className="h-4 w-4 text-blue-900 animate-spin" />
                <span>AI is recalling historical archives...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendDoubt} className="border-t border-slate-100 p-3.5 bg-white flex items-center gap-2.5">
          <input
            id="ai-doubt-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your academic or syllabus doubt in English or Odia..."
            className="flex-1 px-4 py-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={handleTriggerVoice}
            className={`p-2.5 rounded-xl border border-slate-200 transition-colors shrink-0 ${
              isListening ? "bg-red-50 text-red-500 animate-pulse border-red-200" : "bg-slate-50 hover:bg-slate-100 text-slate-500"
            }`}
            title="Simulated voice input"
          >
            <Volume2 className="h-4.5 w-4.5" />
          </button>

          <button
            type="submit"
            disabled={!userInput.trim() || loadingChat}
            className="px-4.5 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl shadow-md transition-colors shrink-0 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Right Column: AI weekly planners & Flashcards (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Adaptive Weekly Planner Trigger */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs">
          <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-orange-500" /> Smart Weekly Study Buddy
          </h4>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Target Exam path</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
              >
                <option value="opsc-ocs">OPSC Civil Services</option>
                <option value="osssc-ri">OSSSC Revenue Inspector</option>
                <option value="ossc-cgl">OSSC Combined Graduate</option>
                <option value="bse-10">BSE Class 10 Board</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Weekly Commitment (Hours/day)</label>
              <input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                min="1"
                max="12"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Type weak topics (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Mensuration formulas, Odia Vyakarana"
                value={weakTopics}
                onChange={(e) => setWeakTopics(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/10 transition-colors flex items-center justify-center gap-2"
            >
              {generatingPlan ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Configuring Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Compile Plan Schedule</span>
                </>
              )}
            </button>
          </div>

          {/* study plan result show box */}
          {studyPlanResult && (
            <div className="mt-4 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-[11px] text-slate-700 leading-normal max-h-36 overflow-y-auto whitespace-pre-wrap">
              {studyPlanResult}
            </div>
          )}
        </div>

        {/* Interactive Flashcard Deck */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-xs relative">
          <h4 className="font-extrabold text-amber-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> Quick Odisha GK Flashcards
          </h4>

          <div className="p-4 bg-white/5 rounded-2xl min-h-[90px] flex items-center justify-center text-center text-xs text-slate-200 border border-white/5">
            <p className="leading-relaxed font-semibold">
              {showAnswer ? flashcards[flashcardIdx].a : flashcards[flashcardIdx].q}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg text-slate-300 font-bold transition-all text-[11px]"
            >
              {showAnswer ? "Show Question" : "Reveal Answer"}
            </button>
            <button
              onClick={() => {
                setShowAnswer(false);
                setFlashcardIdx((prev) => (prev + 1) % flashcards.length);
              }}
              className="text-xs text-amber-400 font-black"
            >
              Next Card &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
