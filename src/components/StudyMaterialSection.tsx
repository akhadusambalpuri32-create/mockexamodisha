import React, { useState, useEffect } from "react";
import { StudyMaterial, SavedNote } from "../types";
import { Download, FileText, Search, PlusCircle, Trash2, Calendar, BookOpen, AlertCircle, Sparkles } from "lucide-react";

interface StudyMaterialProps {
  onSaveNote: (title: string, content: string) => void;
  savedNotes: SavedNote[];
  onDeleteNote: (noteId: string) => void;
}

export default function StudyMaterialSection({
  onSaveNote,
  savedNotes,
  onDeleteNote
}: StudyMaterialProps) {
  const [pdfs, setPdfs] = useState<StudyMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadCount, setDownloadCount] = useState<Record<string, number>>({});

  // Notes Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Load downloadable PDFs
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const response = await fetch("/api/study-materials");
        const data = await response.json();
        setPdfs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPDFs();
  }, []);

  const handleDownload = (pdfId: string, title :string) => {
    setDownloadCount((prev) => ({
      ...prev,
      [pdfId]: (prev[pdfId] || 0) + 1
    }));
    // Simple custom alert simulation
    alert(`Downloading offline file: ${title}. Successful save to downloads registry!`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    onSaveNote(noteTitle, noteContent);
    setNoteTitle("");
    setNoteContent("");
  };

  const filteredPDFs = pdfs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-12 gap-6 font-sans animate-fade-in" id="study-hub-root">
      {/* Left Column: PDFs & Notes lists (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* PDF Download section */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-blue-950 text-lg flex items-center gap-2">
                <FileText className="h-5.5 w-5.5 text-[#1e3a8a]" /> Odisha Prep PDF Book Store
              </h3>
              <p className="text-xs text-slate-500">Official syllabus notes, monthly currents, and previous year papers compiled bilingually.</p>
            </div>

            {/* Simple Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search GK books..."
                value={searchQuery}
                className="pl-9 pr-4 py-1.5 border border-slate-205 rounded-lg text-xs outline-none focus:border-blue-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredPDFs.map((pdf) => (
              <div key={pdf.id} className="border border-slate-150 rounded-2xl p-4 hover:border-blue-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-9 w-9 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs mb-3 font-mono">
                    {pdf.type}
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1 line-clamp-2">{pdf.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mb-4">Size: {pdf.size}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {(pdf.downloads + (downloadCount[pdf.id] || 0))} Downloads
                  </span>
                  <button
                    onClick={() => handleDownload(pdf.id, pdf.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] hover:bg-blue-950 text-white rounded-lg text-[10px] font-bold transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Offline Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved notes self list */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs">
          <h3 className="font-extrabold text-blue-950 text-base mb-4 flex items-center gap-1.5">
            <BookOpen className="h-5 w-5 text-amber-500" /> Personal Revision Notebook
          </h3>

          {savedNotes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
              Your notebook is currently empty. Use the drafting board on the right to note down key formulae!
            </p>
          ) : (
            <div className="space-y-4">
              {savedNotes.map((note) => (
                <div key={note.id} className="p-4 bg-amber-50/20 border border-amber-200/50 rounded-2xl relative">
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="text-[9px] font-bold text-amber-700 block mb-1">{note.date}</span>
                  <h4 className="font-bold text-slate-850 text-sm mb-1.5">{note.title}</h4>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Add revision notes Form (4 Cols) */}
      <div className="lg:col-span-4">
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs bg-gradient-to-b from-white to-slate-50 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider">
              Draft Notes & Reminders
            </h4>
          </div>

          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Subject Header</label>
              <input
                type="text"
                placeholder="e.g. History - Kharavela Emperor"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Details / Bullet formulas</label>
              <textarea
                placeholder="Write critical revision keys here... "
                value={noteContent}
                rows={4}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" /> Save Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
