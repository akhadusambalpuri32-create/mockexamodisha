import React, { useState, useEffect } from "react";
import { LeaderboardUser } from "../types";
import { Trophy, Search, MapPin, Medal, Flame, Award, Loader2 } from "lucide-react";

export default function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Load from backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to load state leaderboards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const districtsList = [
    "All Districts",
    "Khordha",
    "Ganjam",
    "Cuttack",
    "Sambalpur",
    "Bhadrak",
    "Mayurbhanj",
    "Balasore",
    "Puri",
    "Koraput",
    "Bolangir"
  ];

  // Filtering Logic
  const filteredData = leaderboard.filter((item) => {
    const matchDistrict = districtFilter === "All Districts" || item.district === districtFilter;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchSearch;
  });

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs font-sans" id="leaderboard-root">
      {/* Upper Brand Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-blue-950 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500 fill-orange-500 animate-bounce" />
            Odisha State Level Merit Ranks
          </h2>
          <p className="text-xs text-slate-500">Live merit database syncing exam score metrics across 30 state districts.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9.5 pr-4 py-2 text-xs border border-slate-205 bg-slate-50 rounded-xl outline-none focus:border-blue-500 max-w-[180px]"
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-205 text-slate-600 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
          >
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
          <Loader2 className="h-8 w-8 text-blue-900 animate-spin mb-3" />
          <span>Syncing student ranks with database databases...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toppers Podium Highlights (Top 3) */}
          {filteredData.length >= 3 && districtFilter === "All Districts" && (
            <div className="grid grid-cols-3 gap-3 mb-6 bg-blue-50/40 p-4 rounded-3xl border border-blue-100/30">
              {/* Rank 2 */}
              <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 flex flex-col justify-center items-center shadow-xs">
                <div className="bg-slate-100 text-slate-600 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs mb-2">2</div>
                <span className="block text-xs font-bold text-slate-800 truncate max-w-full">{filteredData[1]?.name}</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {filteredData[1]?.district}</span>
                <span className="text-[10px] font-black text-blue-900 mt-2">{filteredData[1]?.points} XP</span>
              </div>

              {/* Rank 1 */}
              <div className="bg-white p-3.5 rounded-2xl text-center border-2 border-orange-400 flex flex-col justify-center items-center relative shadow-sm">
                <span className="absolute top-0 transform -translate-y-1/2 bg-orange-400 text-slate-950 text-[8px] font-black px-2.5 py-0.5 rounded-full">
                  STATE TOPPER
                </span>
                <div className="bg-yellow-400 text-slate-900 h-7 w-7 rounded-full flex items-center justify-center font-black text-xs mb-2 shadow-xs">1</div>
                <span className="block text-xs font-extrabold text-blue-950 truncate max-w-full">{filteredData[0]?.name}</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {filteredData[0]?.district}</span>
                <span className="text-[10px] font-black text-orange-600 mt-2">{filteredData[0]?.points} XP</span>
              </div>

              {/* Rank 3 */}
              <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 flex flex-col justify-center items-center shadow-xs">
                <div className="bg-amber-100 text-amber-800 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs mb-2">3</div>
                <span className="block text-xs font-bold text-slate-800 truncate max-w-full">{filteredData[2]?.name}</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {filteredData[2]?.district}</span>
                <span className="text-[10px] font-black text-blue-900 mt-2">{filteredData[2]?.points} XP</span>
              </div>
            </div>
          )}

          {/* Leaderboard Tables */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">State Rank</th>
                  <th className="py-3 px-4">Aspirant Name</th>
                  <th className="py-3 px-4 text-center">District</th>
                  <th className="py-3 px-4 text-center">Mo Mocks Attempt</th>
                  <th className="py-3 px-4 text-center">Streak Track</th>
                  <th className="py-3 px-4 text-right">Merit XP Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-black text-slate-700">
                      {student.rank === 1 ? (
                        <span className="text-yellow-600 flex items-center gap-1 font-sans"><Medal className="h-4 w-4 fill-yellow-500" /> #{student.rank}</span>
                      ) : student.rank === 2 ? (
                        <span className="text-slate-500 flex items-center gap-1 font-sans"><Medal className="h-4 w-4 fill-slate-300" /> #{student.rank}</span>
                      ) : student.rank === 3 ? (
                        <span className="text-amber-700 flex items-center gap-1 font-sans"><Medal className="h-4 w-4 fill-amber-300" /> #{student.rank}</span>
                      ) : (
                        `#${student.rank}`
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-950 font-sans">{student.name}</td>
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">
                      <span className="bg-slate-100/55 text-slate-600 font-bold px-2.5 py-0.5 rounded-lg border border-slate-205">
                        {student.district}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">{student.testCount} Tests</td>
                    <td className="py-3 px-4 text-center font-bold text-orange-600 font-sans">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 fill-orange-500 stroke-orange-500" />
                        {student.activeStreak} Days
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#1e3a8a] font-mono">{student.points} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                No matching student toppers found for selected criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
