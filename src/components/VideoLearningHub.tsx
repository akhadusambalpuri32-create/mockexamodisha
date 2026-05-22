import React, { useState } from "react";
import { PlayCircle, ShieldAlert, Sparkles, MessageSquare, Send, Heart } from "lucide-react";

export default function VideoLearningHub() {
  const [activeVideo, setActiveVideo] = useState({
    id: "v-1",
    title: "Odisha Modern History - Paika Rebellion & Baxi Jagabandhu Mastery",
    channel: "Odisha Exam Academy",
    views: "2.4K views",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // standard mock
  });

  const videoList = [
    { id: "v-1", title: "Odisha Modern History - Paika Rebellion & Baxi Jagabandhu Mastery", duration: "42:15", mentor: "Dr. Arundhati Das" },
    { id: "v-2", title: "OSSSC Mathematics - Mensuration 2D Core Hacks with formula sheet", duration: "1:15:00", mentor: "Er. Satyabrata Sahu" },
    { id: "v-3", title: "Odia Vyakarana Sandhi and Samasa rules for Competitive exams", duration: "32:40", mentor: "Pandit Nilakantha Das" },
    { id: "v-4", title: "Monthly Static GK Special - Rivers, Dams, and Sanctuaries in Odisha", duration: "50:18", mentor: "Dr. Arundhati Das" }
  ];

  const [liveChat, setLiveChat] = useState([
    { name: "Debasis M.", text: "This is super clear, Ma'am!" },
    { name: "Mamata Sahu", text: "Is this syllabus also for B.Ed eligibility?" },
    { name: "Kalinga_Boy", text: "Great speed metrics here" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLiveChat([...liveChat, { name: "You (Aspirant)", text: chatInput }]);
    setChatInput("");
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 font-sans animate-fade-in" id="video-academy-root">
      {/* 8 Cols Left: Main Video Stream screen & Live chat ticker */}
      <div className="lg:col-span-8 space-y-4">
        {/* Mock video frame container */}
        <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden relative border border-slate-800 shadow-lg group">
          {/* Cover Placeholder overlay with beautiful theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/65 to-slate-950/20 z-10 flex flex-col justify-end p-6">
            <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm w-fit mb-3 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping"></span>
              Live Lecture Room
            </span>
            <h2 className="text-white font-extrabold text-base md:text-xl leading-tight mb-2 truncate max-w-full">
              {activeVideo.title}
            </h2>
            <p className="text-xs text-slate-300">Channel Partner: {activeVideo.channel}</p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-16 w-16 bg-blue-900/80 hover:bg-orange-500 hover:scale-105 rounded-full text-white flex items-center justify-center cursor-pointer shadow-2xl transition-all">
              <PlayCircle className="h-10 w-10 fill-white stroke-none ml-1" />
            </div>
          </div>
        </div>

        {/* Video properties description */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">{activeVideo.title}</h3>
            <span className="text-xs text-[#1e3a8a] font-bold">Recommended for OSSSC/OPSC targets</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Take notes along side the class. In this module, we evaluate core blueprints of regional resistance, Baxi Jagabandhu's naval strategy across Chilika, Banapur, and Khurda fortresses, along with fiscal implications on revenue collectors.
          </p>
        </div>

        {/* Live Classroom Chat simulation */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-4 flex flex-col h-52">
          <h4 className="font-bold text-xs text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-blue-900" /> Live Lecture Chatroom Ticker
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {liveChat.map((chat, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-bold text-blue-950 mr-1.5">{chat.name}:</span>
                <span className="text-slate-600">{chat.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask mentor or type live answer..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-grow rounded-xl border border-slate-200 outline-none text-xs px-3 py-2 focus:border-blue-500 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* 4 Cols Right: Video Playlist list */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs bg-gradient-to-b from-white to-slate-50 sticky top-24">
          <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Dynamic Class Playlist
          </h4>

          <div className="space-y-3">
            {videoList.map((video) => (
              <button
                key={video.id}
                onClick={() =>
                  setActiveVideo({
                    id: video.id,
                    title: video.title,
                    channel: "Odisha Exam Academy",
                    views: "2.5K views",
                    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                  })
                }
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-start gap-2.5 hover:bg-blue-55 ${
                  activeVideo.id === video.id ? "border-blue-500 bg-blue-50/40 text-blue-900" : "border-slate-150 text-slate-700"
                }`}
              >
                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <PlayCircle className="h-4.5 w-4.5 text-blue-900" />
                </div>
                <div>
                  <h5 className="font-bold text-[11px] leading-tight line-clamp-2">{video.title}</h5>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Mentor: {video.mentor} | {video.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
