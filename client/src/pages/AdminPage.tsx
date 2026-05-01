import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Assessment } from "@shared/schema";

const ADMIN_PASSWORD_KEY = "ccsss_admin_pw";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Low" | "Moderate" | "High">("All");

  // Persist password in session so they don't re-enter on refresh
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
    if (saved) {
      setPassword(saved);
      fetchSubmissions(saved);
    }
  }, []);

  const fetchSubmissions = async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/submissions", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("Incorrect password.");
        setAuthed(false);
        sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
      setAuthed(true);
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw);
    } catch {
      setError("Failed to connect to server.");
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions(password);
  };

  const handleDownloadPDF = async (s: any) => {
    // Regenerate PDF fresh from stored data — no DB blob needed
    try {
      const { generatePDFReport } = await import('@/lib/pdfGenerator');
      const userInfo = {
        name: s.name,
        email: s.email,
        age: String(s.age),
        studentId: s.studentId,
        gender: s.gender ?? '',
        semester: s.semester ?? '',
        scholarType: s.scholarType ?? '',
        qualification: s.qualification ?? '',
      };
      const result = {
        coreScore: s.coreScore,
        moduleScores: s.moduleScores ?? {},
        totalScore: s.totalScore,
        maxScore: s.maxScore,
        percentage: s.percentage,
        stressLevel: s.stressLevel,
        dominantCategories: s.dominantCategories ?? [],
        completedAt: s.createdAt ?? new Date().toISOString(),
      };
      await generatePDFReport(
        result,
        s.coreResponses ?? [],
        s.moduleResponses ?? [],
        userInfo,
        s.interpretation ?? ''
      );
    } catch (e) {
      alert('Failed to generate PDF. Please try again.');
      console.error(e);
    }
  };

  const handleExport = () => {
    window.open(
      `/api/admin/export.csv?_auth=${encodeURIComponent(password)}`,
      "_blank"
    );
    // Actually use header-based auth via fetch + blob download
    fetch("/api/admin/export.csv", {
      headers: { "x-admin-password": password },
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ccsss-submissions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const filtered = (submissions || []).filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || s.stressLevel === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    Low: submissions.filter(s => s.stressLevel === "Low").length,
    Moderate: submissions.filter(s => s.stressLevel === "Moderate").length,
    High: submissions.filter(s => s.stressLevel === "High").length,
  };

  const stressColor = (level: string) => {
    if (level === "Low") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (level === "Moderate") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-rose-400 bg-rose-400/10 border-rose-400/20";
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Admin Dashboard</h1>
            <p className="text-white/50 text-sm mt-1">CCSSS — </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold rounded-2xl shadow-lg disabled:opacity-60"
            >
              {loading ? "Checking..." : "Enter Dashboard"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">Admin Dashboard</h1>
            <p className="text-white/50 mt-1">Combined College Student Stress Scale — </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fetchSubmissions(password)}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm font-heading hover:bg-white/10 transition-all"
            >
              ↻ Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExport}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-heading font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Submissions", value: submissions.length, color: "from-indigo-500 to-purple-600", target: "/ 150" },
            { label: "Low Stress", value: counts.Low, color: "from-emerald-500 to-teal-600", target: "" },
            { label: "Moderate Stress", value: counts.Moderate, color: "from-amber-500 to-orange-600", target: "" },
            { label: "High Stress", value: counts.High, color: "from-rose-500 to-pink-600", target: "" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5"
            >
              <p className="text-white/50 text-xs font-heading uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-heading`}>
                {stat.value}
                <span className="text-white/30 text-sm font-normal ml-1">{stat.target}</span>
              </p>
              {stat.target && (
                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stat.value / 150) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Search + Filter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, student ID or email..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
          />
          <div className="flex gap-2">
            {(["All", "Low", "Moderate", "High"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-heading font-medium transition-all border ${
                  filter === f
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["#", "Student ID", "Name", "Email", "Age", "Gender", "Qualification", "Semester", "Residence", "Core", "Total", "Max", "%", "Stress Level", "PDF", "Submitted"].map(h => (
                    <th key={h} className="text-left text-white/40 font-heading font-medium text-xs uppercase tracking-wider px-4 py-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center text-white/30 py-16 text-sm">
                        {submissions.length === 0 ? "No submissions yet. Share the assessment link with students!" : "No results match your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, i) => {
                      const moduleScores = s.moduleScores as Record<string, number>;
                      const moduleList = Object.entries(moduleScores)
                        .map(([name, score]) => `${name.split(" ")[0]}: ${score}`)
                        .join(", ");
                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-white/30 font-mono">{s.id}</td>
                          <td className="px-4 py-3.5 text-indigo-300 font-mono font-medium">{s.studentId}</td>
                          <td className="px-4 py-3.5 text-white font-medium whitespace-nowrap">{s.name}</td>
                          <td className="px-4 py-3.5 text-white/60">{s.email}</td>
                          <td className="px-4 py-3.5 text-white/60">{s.age}</td>
                          <td className="px-4 py-3.5 text-white/60">{(s as any).gender ?? "—"}</td>
                          <td className="px-4 py-3.5 text-white/60">{(s as any).qualification ?? "—"}</td>
                          <td className="px-4 py-3.5 text-white/60">{(s as any).semester ?? "—"}</td>
                          <td className="px-4 py-3.5 text-white/60">{(s as any).scholarType ?? "—"}</td>
                          <td className="px-4 py-3.5 text-white/80 font-mono">{s.coreScore}</td>
                          <td className="px-4 py-3.5 text-white font-mono font-semibold">{s.totalScore}</td>
                          <td className="px-4 py-3.5 text-white/40 font-mono">{s.maxScore}</td>
                          <td className="px-4 py-3.5 text-white/80 font-mono">{s.percentage}%</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-heading font-semibold border ${stressColor(s.stressLevel)}`}>
                              {s.stressLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                              <button
                                onClick={() => handleDownloadPDF(s)}
                                className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-heading hover:bg-emerald-500/30 transition-all"
                              >
                                ↓ PDF
                              </button>
                          </td>
                          <td className="px-4 py-3.5 text-white/40 whitespace-nowrap text-xs">
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-6">
          Showing {filtered.length} of {submissions.length} submissions · CCSSS Admin Panel · CCSSS Research Project
        </p>
      </div>
    </div>
  );
}