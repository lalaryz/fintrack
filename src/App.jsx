import { useState, useMemo, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

// ─── INITIAL ACCOUNTS (DISET PERSIS BERDASARKAN GAMBAR SPREADSHEET ANDA) ────────
const INITIAL_ACCOUNTS = [
  // 🛡️ Alokasi Dana Darurat
  { id: 1,  name: "Bibit Reksadana (DD)",  institution: "Bibit",        type: "Reksa Dana",    goal: "Dana Darurat",        balance: 10_000_000, color: "#ef4444" },
  { id: 2,  name: "Jago DD",               institution: "Jago",         type: "Bank Digital",  goal: "Dana Darurat",        balance: 15_000_000, color: "#f87171" },
  { id: 3,  name: "Bibit Obligasi (DD)",   institution: "Bibit",        type: "Obligasi",      goal: "Dana Darurat",        balance: 15_000_000, color: "#fca5a5" },

  // 🏠 Alokasi Dana Rumah
  { id: 4,  name: "Bibit Reksadana (Rumah)",institution: "Bibit",       type: "Reksa Dana",    goal: "Dana Rumah",          balance: 25_000_000, color: "#10b981" },
  { id: 5,  name: "Line Deposito (Rumah)",  institution: "Line Bank",    type: "Deposito",      goal: "Dana Rumah",          balance: 30_000_000, color: "#34d399" },
  { id: 6,  name: "OCBC Taka Bunga",       institution: "OCBC",         type: "Bank Swasta",   goal: "Dana Rumah",          balance: 15_000_000, color: "#059669" },

  // 👴 Alokasi Dana Pensiun
  { id: 7,  name: "Bibit Reksadana (Pens)",institution: "Bibit",        type: "Reksa Dana",    goal: "Dana Pensiun",        balance: 45_000_000, color: "#6366f1" },

  // 🎓 Alokasi Dana Pendidikan
  { id: 8,  name: "Jago Edu",              institution: "Jago",         type: "Bank Digital",  goal: "Dana Pendidikan",     balance: 8_500_000,  color: "#3b82f6" },
  { id: 9,  name: "Bibit Reksadana (Edu)", institution: "Bibit",        type: "Reksa Dana",    goal: "Dana Pendidikan",     balance: 12_000_000, color: "#60a5fa" },
  { id: 10, name: "Bibit Saham (Edu)",     institution: "Bibit",        type: "Saham",         goal: "Dana Pendidikan",     balance: 15_000_000, color: "#93c5fd" },
  { id: 11, name: "Gotrade (Edu)",         institution: "Gotrade",      type: "Saham US",      goal: "Dana Pendidikan",     balance: 10_000_000, color: "#a855f7" },
  { id: 12, name: "Indodax BTC (Edu)",     institution: "Indodax",      type: "Crypto",        goal: "Dana Pendidikan",     balance: 7_500_000,  color: "#ec4899" },
  { id: 13, name: "Bareksa Emas (Edu)",    institution: "Bareksa",      type: "Emas",          goal: "Dana Pendidikan",     balance: 9_000_000,  color: "#eab308" },

  // 🐏 Alokasi Qurban
  { id: 14, name: "BCA USD (Qurban)",      institution: "BCA",          type: "Bank Swasta",   goal: "Qurban",              balance: 5_000_000,  color: "#d97706" },

  // 🕋 Alokasi Umroh/haji
  { id: 15, name: "BCA USD (Umroh)",       institution: "BCA",          type: "Bank Swasta",   goal: "Umroh/haji",          balance: 12_000_000, color: "#0d9488" },
  { id: 16, name: "OCBC USD (Umroh)",      institution: "OCBC",         type: "Bank Swasta",   goal: "Umroh/haji",          balance: 18_000_000, color: "#14b8a6" },

  // 💵 Alokasi THR
  { id: 17, name: "Jago THR",              institution: "Jago",         type: "Bank Digital",  goal: "THR",                 balance: 6_000_000,  color: "#db2777" },

  // 🏥 Alokasi Kesehatan
  { id: 18, name: "Jago sehatyaa",         institution: "Jago",         type: "Bank Digital",  goal: "Kesehatan",           balance: 4_500_000,  color: "#06b6d4" },
  { id: 19, name: "BLU dokter",            institution: "BLU BCA",      type: "Bank Digital",  goal: "Kesehatan",           balance: 3_500_000,  color: "#22d3ee" },

  // ✈️ Alokasi Liburan
  { id: 20, name: "Jago Holiday",          institution: "Jago",         type: "Bank Digital",  goal: "Liburan",             balance: 8_000_000,  color: "#fb923c" },

  // 👨‍👩‍👧‍👦 Alokasi Keluarga
  { id: 21, name: "Jago Fams",             institution: "Jago",         type: "Bank Digital",  goal: "Keluarga",            balance: 10_000_000, color: "#f43f5e" },

  // 💵 Rekening Operasional (Untuk menampung gaji & pengeluaran bulanan aktif)
  { id: 22, name: "BLU Operasional",       institution: "BLU BCA",      type: "Bank Digital",  goal: "Operasional",         balance: 5_200_000,  color: "#64748b" },
  { id: 23, name: "Shopee Pay",            institution: "Shopee",       type: "E-Wallet",      goal: "Operasional",         balance: 1_250_000,  color: "#94a3b8" },
];

const INITIAL_TRANSACTIONS = [
  // Januari 2026
  { id: 1,  date: "2026-01-05", account_id: 22, category: "Income",    sub: "Gaji",         type: "income",   amount:  15_000_000, note: "Gaji Bulanan Masuk" },
  { id: 2,  date: "2026-01-06", account_id: 2,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Top-up Jago DD (Darurat)", pair: 22 },
  { id: 3,  date: "2026-01-06", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Top-up Jago DD (Darurat)", pair: 2 },
  { id: 4,  date: "2026-01-08", account_id: 23, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Isi Saldo Shopee Pay", pair: 22 },
  { id: 5,  date: "2026-01-08", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Isi Saldo Shopee Pay", pair: 23 },
  { id: 6,  date: "2026-01-10", account_id: 22, category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -450_000, note: "Belanja Mingguan Alfamart" },
  { id: 7,  date: "2026-01-12", account_id: 4,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Nabung Bibit Reksadana Rumah" },
  { id: 8,  date: "2026-01-15", account_id: 22, category: "Expense",   sub: "Transportasi", type: "expense",  amount:    -320_000, note: "Pembayaran Tol & Bensin" },
  { id: 9,  date: "2026-01-20", account_id: 8,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   2_500_000, note: "Alokasi Sekolah Jago Edu", pair: 22 },
  { id: 10, date: "2026-01-20", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -2_500_000, note: "Alokasi Sekolah Jago Edu", pair: 8 },
  { id: 11, date: "2026-01-25", account_id: 22, category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Tagihan Listrik & WiFi" },

  // Februari 2026
  { id: 12, date: "2026-02-05", account_id: 22, category: "Income",    sub: "Gaji",         type: "income",   amount:  15_000_000, note: "Gaji Bulanan Masuk" },
  { id: 13, date: "2026-02-06", account_id: 2,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Nabung Tambahan Jago DD", pair: 22 },
  { id: 14, date: "2026-02-06", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Nabung Tambahan Jago DD", pair: 2 },
  { id: 15, date: "2026-02-10", account_id: 17, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   2_000_000, note: "Cicilan Jago THR", pair: 22 },
  { id: 16, date: "2026-02-10", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -2_000_000, note: "Cicilan Jago THR", pair: 17 },
  { id: 17, date: "2026-02-15", account_id: 21, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Tabungan Jago Fams", pair: 22 },
  { id: 18, date: "2026-02-15", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Tabungan Jago Fams", pair: 21 },
  { id: 19, date: "2026-02-20", account_id: 15, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Tabung Umroh BCA USD", pair: 22 },
  { id: 20, date: "2026-02-20", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Tabung Umroh BCA USD", pair: 15 },

  // Maret 2026
  { id: 21, date: "2026-03-05", account_id: 22, category: "Income",    sub: "Gaji",         type: "income",   amount:  15_000_000, note: "Gaji Bulanan Masuk" },
  { id: 22, date: "2026-03-07", account_id: 18, category: "Expense",   sub: "Kesehatan",    type: "expense",  amount:  -1_200_000, note: "Biaya Dokter & Obat Sehat" },
  { id: 23, date: "2026-03-10", account_id: 13, category: "Investasi", sub: "Emas",         type: "invest",   amount:   1_000_000, note: "Beli Bareksa Emas Edu" },
  { id: 24, date: "2026-03-15", account_id: 11, category: "Investasi", sub: "Saham US",      type: "invest",   amount:   2_500_000, note: "Top-up Gotrade Edu" },
  { id: 25, date: "2026-03-22", account_id: 20, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_000_000, note: "Cicilan Jago Holiday", pair: 22 },
  { id: 26, date: "2026-03-22", account_id: 22, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_000_000, note: "Cicilan Jago Holiday", pair: 20 },
];

const INITIAL_GOALS = [
  { id: 1, name: "Dana Darurat",       target: 50_000_000,  icon: "🛡️", color: "#ef4444", date: "2027-01-01" },
  { id: 2, name: "Dana Rumah",         target: 150_000_000, icon: "🏠", color: "#10b981", date: "2028-06-01" },
  { id: 3, name: "Dana Pensiun",       target: 300_000_000, icon: "👴", color: "#6366f1", date: "2045-01-01" },
  { id: 4, name: "Dana Pendidikan",    target: 120_000_000, icon: "🎓", color: "#3b82f6", date: "2030-01-01" },
  { id: 5, name: "Qurban",             target: 10_000_000,  icon: "🐏", color: "#d97706", date: "2026-06-15" },
  { id: 6, name: "Umroh/haji",         target: 100_000_000, icon: "🕋", color: "#0d9488", date: "2029-12-01" },
  { id: 7, name: "THR",                target: 15_000_000,  icon: "💵", color: "#db2777", date: "2027-04-01" },
  { id: 8, name: "Kesehatan",          target: 20_000_000,  icon: "🏥", color: "#06b6d4", date: "2027-06-01" },
  { id: 9, name: "Liburan",            target: 15_000_000,  icon: "✈️", color: "#fb923c", date: "2026-12-01" },
  { id: 10, name: "Keluarga",          target: 25_000_000,  icon: "👨‍👩‍👧‍👦", color: "#f43f5e", date: "2027-01-01" },
];

const MONTHLY_DATA = [
  { month: "Jan", income: 15_000_000, expense: 5_070_000, invest: 2_000_000, asset: 215_000_000 },
  { month: "Feb", income: 15_000_000, expense: 5_400_000, invest: 7_000_000, asset: 228_350_000 },
  { month: "Mar", income: 15_000_000, expense: 6_550_000, invest: 5_500_000, asset: 236_150_000 },
  { month: "Apr", income: 15_000_000, expense: 5_000_000, invest: 7_000_000, asset: 249_300_000 },
  { month: "Mei", income: 15_800_000, expense: 5_850_000, invest: 3_000_000, asset: 298_450_000 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${(n / 1_000).toFixed(0)} Rb`;
};
const fmtDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const TYPE_COLOR = { income: "#10b981", expense: "#f43f5e", transfer: "#6366f1", invest: "#a855f7" };
const TYPE_LABEL = { income: "Masuk", expense: "Keluar", transfer: "Transfer", invest: "Investasi" };
const TYPE_ICON  = { income: "↑", expense: "↓", transfer: "⇄", invest: "◉" };

const TOOLTIP_STYLE = {
  backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
  borderRadius: "12px", padding: "10px 14px", color: "#1e293b", fontSize: 13,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
};

// ─── UTILITY EXPORT SPREADSHEET ──────────────────────────────────────────────
const downloadCSV = (content, filename) => {
  const csvContent = "\uFEFF" + content; 
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 ${className}`}>{children}</div>
);

const Badge = ({ children, color }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
    style={{ backgroundColor: color + "15", color }}>{children}</span>
);

const StatCard = ({ label, value, sub, icon, color }) => (
  <Card className="flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 animate-fade-in"
      style={{ backgroundColor: color + "15" }}>{icon}</div>
    <div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-lg font-extrabold text-slate-800">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5 leading-none">{sub}</div>}
    </div>
  </Card>
);

const TxRow = ({ tx, accMap, showAccount = true }) => {
  const acc = accMap[tx.account_id];
  return (
    <div className="bg-white border border-slate-100 hover:border-slate-200 shadow-sm rounded-xl p-3.5 flex items-center justify-between transition-all duration-250">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: TYPE_COLOR[tx.type] + "15", color: TYPE_COLOR[tx.type] }}>
          {TYPE_ICON[tx.type]}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800 leading-tight">{tx.note}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-slate-400">{fmtDate(tx.date)}</span>
            {showAccount && acc && <>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-semibold">{acc.name}</span>
            </>}
            <Badge color={TYPE_COLOR[tx.type]}>{TYPE_LABEL[tx.type]}</Badge>
          </div>
        </div>
      </div>
      <div className={`text-sm font-extrabold shrink-0 ml-2 ${tx.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
        {tx.amount > 0 ? "+" : ""}{fmtShort(Math.abs(tx.amount))}
      </div>
    </div>
  );
};

// ─── GOAL DETAIL PAGE ────────────────────────────────────────────────────────
function GoalDetail({ goal, onBack, accounts, transactions, onUpdateTarget, handleExportGroup }) {
  const accMap = useMemo(() => Object.fromEntries(accounts.map(a => [a.id, a])), [accounts]);
  const [filterType, setFilterType] = useState("semua");
  const [isEditing, setIsEditing] = useState(false);
  const [inputTarget, setInputTarget] = useState(goal.target);

  const relatedAccs = useMemo(() => accounts.filter(a => a.goal === goal.name), [accounts, goal.name]);
  const relatedAccIds = useMemo(() => relatedAccs.map(a => a.id), [relatedAccs]);

  const allTx = useMemo(() =>
    transactions
      .filter(t => relatedAccIds.includes(t.account_id))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, relatedAccIds]
  );

  const filtered = useMemo(() =>
    filterType === "semua" ? allTx : allTx.filter(t => t.type === filterType),
    [allTx, filterType]
  );

  const totalMasuk  = allTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalKeluar = allTx.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const pct = Math.min(100, (goal.current / goal.target) * 100);

  const monthlyChart = useMemo(() => {
    const bulan = ["Jan","Feb","Mar","Apr","Mei"];
    return bulan.map((m, i) => ({
      month: m,
      saldo: Math.round(goal.current * (0.6 + 0.1 * i)),
    }));
  }, [goal.current]);

  const filters = ["semua","income","expense","transfer","invest"];

  const handleSaveTarget = () => {
    onUpdateTarget(goal.id, Number(inputTarget));
    setIsEditing(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-lg transition-colors">
            ←
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{goal.icon}</span>
              <h1 className="text-lg font-bold text-slate-800">{goal.name}</h1>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Target Selesai: {new Date(goal.date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Progress card & Target Editor */}
      <div className="rounded-2xl p-5 border shadow-sm transition-all bg-white" style={{ borderColor: goal.color + "30", backgroundColor: goal.color + "08" }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Terkumpul Saat Ini</div>
            <div className="text-2xl font-black text-slate-800">{fmt(goal.current)}</div>
            
            {isEditing ? (
              <div className="flex flex-col gap-2 mt-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Atur Target Baru (Rp)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputTarget}
                    onChange={(e) => setInputTarget(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-36 font-semibold"
                  />
                  <button onClick={handleSaveTarget} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Simpan</button>
                  <button onClick={() => { setIsEditing(false); setInputTarget(goal.target); }} className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">Batal</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400 font-medium">dari total target {fmt(goal.target)}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors">
                  ✏️ Edit Target
                </button>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: goal.color }}>{pct.toFixed(0)}%</div>
          </div>
        </div>
        <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
          <div className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: goal.color }} />
        </div>
      </div>

      {/* 📥 EXPORT KHUSUS KELOMPOK INI */}
      <Card className="border-emerald-100 bg-emerald-50/10 flex items-center justify-between gap-4 p-4">
        <div>
          <div className="text-xs font-extrabold text-slate-700">Audit Khusus {goal.name}</div>
          <p className="text-[10px] text-slate-400 mt-1">Bandingkan saldo & mutasi kelompok ini di Excel</p>
        </div>
        <button
          onClick={() => handleExportGroup(goal.name, "transactions")}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh CSV Kelompok
        </button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Dana Masuk</div>
          <div className="text-sm font-extrabold text-emerald-600">+{fmtShort(totalMasuk)}</div>
          <div className="text-xs text-slate-400 mt-0.5">{allTx.filter(t=>t.amount>0).length} transaksi</div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Dana Keluar</div>
          <div className="text-sm font-extrabold text-rose-600">{fmtShort(totalKeluar)}</div>
          <div className="text-xs text-slate-400 mt-0.5">{allTx.filter(t=>t.amount<0).length} transaksi</div>
        </div>
      </div>

      {/* Akun terdaftar khusus untuk goal ini */}
      {relatedAccs.length > 0 && (
        <Card>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Daftar Akun Terpecah ({relatedAccs.length})</h3>
          <div className="space-y-3">
            {relatedAccs.map(acc => (
              <div key={acc.id} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: acc.color + "15", color: acc.color }}>
                    {acc.name[0]}
                  </div>
                  <div>
                    <div className="text-xs text-slate-800 font-bold">{acc.name}</div>
                    <div className="text-[10px] text-slate-400">{acc.institution} · {acc.type}</div>
                  </div>
                </div>
                <div className="text-xs font-extrabold text-slate-700">{fmt(acc.balance)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Grafik Pertumbuhan Dana</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={monthlyChart}>
            <defs>
              <linearGradient id={`grad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={goal.color} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={goal.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmtShort(v), "Estimasi"]} />
            <Area type="monotone" dataKey="saldo" stroke={goal.color} strokeWidth={2.5}
              fill={`url(#grad-${goal.id})`} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Filter + Transaksi */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Mutasi Transaksi ({filtered.length})
        </h3>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {filters.map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${filterType === f ? "text-white shadow-sm" : "bg-white border border-slate-200/60 text-slate-500 hover:bg-slate-50"}`}
              style={filterType === f ? { backgroundColor: goal.color } : {}}>
              {f === "semua" ? "Semua" : TYPE_LABEL[f]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl text-slate-400 text-xs font-medium shadow-sm">
            Tidak ada transaksi untuk filter ini
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(tx => (
              <TxRow key={tx.id} tx={tx} accMap={accMap} showAccount={relatedAccs.length > 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GOALS LIST ───────────────────────────────────────────────────────────────
function Goals({ goalsWithComputedCurrent, onSelectGoal, accounts }) {
  const totalTarget  = goalsWithComputedCurrent.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goalsWithComputedCurrent.reduce((s, g) => s + g.current, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Target Keuangan</h1>
        <p className="text-slate-400 text-xs mt-1">
          {goalsWithComputedCurrent.length} Pos Kelompok Dana Terdaftar · Klik untuk mutasi & audit detail
        </p>
      </div>

      {/* Ringkasan total */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Total Seluruh Dana Terkumpul</div>
            <div className="text-2xl font-black text-indigo-900">{fmtShort(totalCurrent)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Target Gabungan</div>
            <div className="text-sm font-extrabold text-indigo-700/80">dari {fmtShort(totalTarget)}</div>
          </div>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2.5 mt-3 overflow-hidden">
          <div className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (totalCurrent/totalTarget)*100).toFixed(1)}%` }} />
        </div>
        <div className="text-[10px] text-slate-500 font-semibold mt-2 text-right">
          {((totalCurrent/totalTarget)*100).toFixed(1)}% Terpenuhi
        </div>
      </div>

      {/* Goal cards — clickable */}
      <div className="space-y-3.5">
        {goalsWithComputedCurrent.map(g => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          const remaining = Math.max(0, g.target - g.current);
          const monthsLeft = Math.max(1, Math.ceil((new Date(g.date) - new Date()) / (1000*60*60*24*30)));
          const needed = remaining / monthsLeft;
          const relatedAccs = accounts.filter(a => a.goal === g.name);

          return (
            <button key={g.id} onClick={() => onSelectGoal(g)}
              className="w-full text-left bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm rounded-2xl p-4 transition-all duration-200 hover:shadow-md active:scale-[0.99] group">

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{g.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {relatedAccs.length > 0
                        ? relatedAccs.map(a => a.name).join(", ")
                        : "Belum ada akun teralokasi"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-black" style={{ color: g.color }}>
                    {pct.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: g.color }} />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-[11px] border-t border-slate-50 pt-3 mt-1 font-medium">
                <div>
                  <div className="text-slate-400 mb-0.5 font-semibold text-[9px] uppercase tracking-wider">Terkumpul</div>
                  <div className="font-bold text-slate-800">{fmtShort(g.current)}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-0.5 font-semibold text-[9px] uppercase tracking-wider">Sisa</div>
                  <div className="font-bold text-rose-500">{fmtShort(remaining)}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-0.5 font-semibold text-[9px] uppercase tracking-wider">Per Bulan</div>
                  <div className="font-bold text-amber-500">{fmtShort(needed)}</div>
                </div>
              </div>

              {/* Tap hint */}
              <div className="mt-3 flex items-center gap-1 text-[10px] font-bold" style={{ color: g.color }}>
                <span>Detail & Edit Target</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ goalsWithComputedCurrent, onGoalClick, accounts, handleExportGroup }) {
  const [exportScope, setExportScope] = useState("semua"); // "semua" atau nama Goal spesifik

  const totalAsset     = accounts.reduce((s, a) => s + a.balance, 0);
  const totalInvest    = accounts.filter(a => ["Reksa Dana","Saham","Emas","Deposito","Obligasi","Saham US","Crypto"].includes(a.type)).reduce((s,a)=>s+a.balance,0);
  const totalCash      = accounts.filter(a => ["Bank Digital","E-Wallet","Bank Swasta"].includes(a.type)).reduce((s,a)=>s+a.balance,0);
  const totalEmergency = accounts.filter(a => a.goal === "Dana Darurat").reduce((s,a)=>s+a.balance,0);

  const pieData = Object.entries(
    accounts.reduce((acc, a) => { 
      if(a.goal !== "Operasional") {
        acc[a.goal] = (acc[a.goal]||0) + a.balance; 
      }
      return acc; 
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#ef4444","#10b981","#6366f1","#3b82f6","#d97706","#0d9488","#db2777","#06b6d4","#fb923c","#f43f5e"];

  const insights = [
    { icon: "📈", text: "Portfolio Anda telah sukses dipecah ke masing-masing sub-akun target secara real-time.", color: "#3b82f6" },
    { icon: "📊", text: "Fitur ekspor CSV di bawah kini mendukung pengunduhan per pos kelompok terpisah.", color: "#10b981" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Dashboard Finansial</h1>
        <p className="text-slate-400 text-xs mt-1">Ringkasan Alokasi Portofolio & Keuangan</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Aset Bersih" value={fmtShort(totalAsset)}    icon="💎" color="#6366f1" sub="Seluruh sub-akun" />
        <StatCard label="Total Investasi" value={fmtShort(totalInvest)}  icon="📈" color="#ec4899" sub="Emas, RD, Saham, Crypto" />
        <StatCard label="Kas & Tabungan"  value={fmtShort(totalCash)}     icon="💵" color="#10b981" sub="Bank digital & swasta" />
        <StatCard label="Pos Dana Darurat" value={fmtShort(totalEmergency)} icon="🛡️" color="#ef4444" sub="Akumulasi saldo riil" />
      </div>

      {/* Export Center (Mendukung unduh per kelompok dana) */}
      <Card className="border-emerald-100 bg-emerald-50/20">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xl">📊</span>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Spreadsheet Export Center center</h3>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-4">
          Unduh data mutasi aktif Anda ke Excel (.csv) secara terpisah per kelompok dana agar mudah dicocokkan dengan spreadsheet Anda.
        </p>
        
        {/* Dropdown Selector */}
        <div className="mb-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 shadow-xs">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pilih Kelompok Alokasi Dana:</label>
          <select 
            value={exportScope} 
            onChange={(e) => setExportScope(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 font-bold focus:outline-none">
            <option value="semua">📂 Semua Kelompok (Gabungan)</option>
            {goalsWithComputedCurrent.map(g => (
              <option key={g.id} value={g.name}>{g.icon} {g.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleExportGroup(exportScope, "transactions")}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm transition-all duration-150">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Unduh Mutasi
          </button>
          <button 
            onClick={() => handleExportGroup(exportScope, "accounts")}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 transition-all duration-150">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Unduh Saldo Akun
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Grafik Pertumbuhan Aset</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY_DATA}>
            <defs>
              <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[fmtShort(v),"Nilai Aset"]} />
            <Area type="monotone" dataKey="asset" stroke="#6366f1" strokeWidth={2.5} fill="url(#assetGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cashflow Bulanan</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MONTHLY_DATA} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,n)=>[fmtShort(v), n==="income"?"Pemasukan":n==="expense"?"Pengeluaran":"Investasi"]} />
            <Bar dataKey="income"  fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="invest"  fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-center">
          {[["#10b981","Pemasukan"],["#ef4444","Pengeluaran"],["#6366f1","Investasi"]].map(([c,l])=>(
            <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
              {l}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Distribusi Berdasarkan Target</h3>
        <p className="text-[10px] text-slate-400 mb-3 font-semibold">Klik salah satu bagian untuk melihat mutasi akun →</p>
        <ResponsiveContainer width="100%" height={185}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value"
              onClick={(d) => {
                const goal = goalsWithComputedCurrent.find(g => g.name === d.name);
                if (goal) onGoalClick(goal);
              }}
              style={{ cursor: "pointer" }}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,n)=>[fmtShort(v),n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {pieData.map((d, i) => (
            <button key={d.name} onClick={() => { const g = goalsWithComputedCurrent.find(g=>g.name===d.name); if(g) onGoalClick(g); }}
              className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 transition-colors text-left font-medium">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="truncate text-[11px]">{d.name} ({fmtShort(d.value)})</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">💡 Analisa Alokasi</h3>
        <div className="space-y-2.5">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-lg">{ins.icon}</span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── ACCOUNTS ────────────────────────────────────────────────────────────────
function Accounts({ accounts, onSelectAccount, transactions, handleExportAccounts }) {
  const grouped = accounts.reduce((acc, a) => {
    const k = ["Bank Digital", "E-Wallet", "Bank Swasta"].includes(a.type) ? "Kas & Rekening Aktif" : "Portofolio Investasi & Aset";
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Daftar Akun Terpecah</h1>
          <p className="text-slate-400 text-xs mt-1">{accounts.length} sub-akun alokasi terdaftar</p>
        </div>
        <button 
          onClick={handleExportAccounts}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh Saldo
        </button>
      </div>

      {Object.entries(grouped).map(([group, accs]) => (
        <div key={group} className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2">{group}</h2>
          <div className="space-y-2.5">
            {accs.map(acc => {
              const txCount = transactions.filter(t => t.account_id === acc.id).length;
              return (
                <button key={acc.id} onClick={() => onSelectAccount(acc)}
                  className="w-full text-left bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm rounded-2xl p-4 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: acc.color+"15", color: acc.color }}>
                        {acc.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{acc.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-semibold">{acc.institution}</span>
                          <Badge color={acc.color}>{acc.goal}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-800">{fmtShort(acc.balance)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">{txCount} mutasi</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountDetail({ account, onBack, transactions, accounts }) {
  const accMap = useMemo(() => Object.fromEntries(accounts.map(a => [a.id, a])), [accounts]);
  const txs = useMemo(() => 
    transactions.filter(t => t.account_id === account.id).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, account.id]
  );

  const monthlyBal = useMemo(() => {
    const base = account.balance;
    const net = txs.reduce((s, t) => s + t.amount, 0);
    return ["Jan","Feb","Mar","Apr","Mei"].map((m, i) => ({
      month: m, saldo: Math.max(0, base - net + (net / 5) * (i + 1))
    }));
  }, [account.balance, txs]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-lg transition-colors">←</button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{account.name}</h1>
          <p className="text-slate-400 text-xs">{account.institution} · {account.type}</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Saldo Saat Ini</div>
        <div className="text-2xl font-black" style={{ color: account.color }}>{fmt(account.balance)}</div>
        <div className="mt-2.5"><Badge color={account.color}>Tujuan: {account.goal}</Badge></div>
      </div>
      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 font-semibold">Pertumbuhan Saldo</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={monthlyBal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[fmtShort(v),"Saldo"]} />
            <Line type="monotone" dataKey="saldo" stroke={account.color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <div>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Histori Mutasi Akun</h2>
        {txs.length === 0
          ? <p className="text-slate-400 text-xs text-center py-8 font-medium">Belum ada aktivitas mutasi</p>
          : <div className="space-y-2.5">{txs.map(tx => <TxRow key={tx.id} tx={tx} accMap={accMap} showAccount={false} />)}</div>
        }
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────
function Transactions({ transactions, accounts, handleExportTransactions }) {
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("semua");
  const accMap = useMemo(() => Object.fromEntries(accounts.map(a=>[a.id,a])), [accounts]);

  const filtered = useMemo(() => 
    transactions
      .filter(t => filter === "semua" || t.type === filter)
      .filter(t => month === "semua" || t.date.startsWith(month))
      .filter(t => search === "" || t.note.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, filter, month, search]
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Semua Transaksi</h1>
          <p className="text-slate-400 text-xs mt-1">{filtered.length} riwayat mutasi ditemukan</p>
        </div>
        <button 
          onClick={handleExportTransactions}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh CSV
        </button>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Cari catatan transaksi..."
        className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["semua","2026-01","2026-02","2026-03","2026-04","2026-05"].map(m => (
          <button key={m} onClick={()=>setMonth(m)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${month===m?"bg-indigo-600 text-white shadow-sm":"bg-white border border-slate-200/60 text-slate-500 hover:bg-slate-50"}`}>
            {m==="semua"?"Semua Bulan":["Jan","Feb","Mar","Apr","Mei"][parseInt(m.split("-")[1])-1]}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["semua","income","expense","transfer","invest"].map(t => (
          <button key={t} onClick={()=>setFilter(t)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filter===t?"bg-indigo-600 text-white shadow-sm":"bg-white border border-slate-200/60 text-slate-500 hover:bg-slate-50"}`}>
            {t==="semua"?"Semua Tipe":TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      
      <div className="space-y-2.5">
        {filtered.map(tx => <TxRow key={tx.id} tx={tx} accMap={accMap} showAccount={true} />)}
        {filtered.length === 0 && <p className="text-slate-400 text-xs text-center py-10 font-medium bg-white border border-slate-100 rounded-2xl shadow-sm">Tidak ada transaksi yang cocok</p>}
      </div>
    </div>
  );
}

// ─── TRANSFER & FUND SHIFT PAGE ──────────────────────────────────────────────────
function Transfer({ accounts, onMigrateFunds }) {
  const [activeTab, setActiveTab] = useState("biasa"); // "biasa" atau "dana-berpindah"
  
  // States untuk Alihkan Dana Antar Target
  const [sourceAccId, setSourceAccId] = useState("");
  const [destAccId, setDestAccId] = useState("");
  const [migrateAmount, setMigrateAmount] = useState("");
  const [migrateNote, setMigrateNote] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleExecuteMigration = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!sourceAccId || !destAccId) {
      setErrorMsg("Mohon pilih sub-akun asal dan tujuan.");
      return;
    }
    if (sourceAccId === destAccId) {
      setErrorMsg("Akun asal dan tujuan tidak boleh sama.");
      return;
    }
    if (!migrateAmount || Number(migrateAmount) <= 0) {
      setErrorMsg("Nominal pengalihan dana harus lebih besar dari 0.");
      return;
    }

    const sourceAcc = accounts.find(a => a.id === Number(sourceAccId));
    if (!sourceAcc || sourceAcc.balance < Number(migrateAmount)) {
      setErrorMsg(`Saldo ${sourceAcc?.name || "akun asal"} tidak mencukupi (Saldo: ${fmt(sourceAcc?.balance || 0)}).`);
      return;
    }

    const success = onMigrateFunds(
      Number(sourceAccId), 
      Number(destAccId), 
      Number(migrateAmount), 
      migrateNote
    );

    if (success) {
      const destAccName = accounts.find(a => a.id === Number(destAccId))?.name;
      setSuccessMsg(`Berhasil mengalihkan ${fmt(Number(migrateAmount))} dari ${sourceAcc.name} ke ${destAccName}!`);
      setMigrateAmount("");
      setMigrateNote("");
      setSourceAccId("");
      setDestAccId("");
    } else {
      setErrorMsg("Gagal melakukan pengalihan dana.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Aliran & Alokasi Dana</h1>
        <p className="text-slate-400 text-xs mt-1">Sirkulasi pemindahan dan pengalihan dana di portofolio Anda</p>
      </div>

      {/* Segment Tab Selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => { setActiveTab("biasa"); setSuccessMsg(""); setErrorMsg(""); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "biasa" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
          💡 Panduan Aliran Saldo
        </button>
        <button 
          onClick={() => { setActiveTab("dana-berpindah"); setSuccessMsg(""); setErrorMsg(""); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "dana-berpindah" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
          ⇄ Alihkan Dana Antar Target
        </button>
      </div>

      {activeTab === "biasa" ? (
        <>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">💡 Pemindahan saldo antar rekening Anda tidak dihitung sebagai pengeluaran konsumtif bulanan, melainkan penyelarasan pos target.</p>
          </div>
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 text-center py-10">
            <span className="text-3xl">🛡️</span>
            <p className="text-slate-700 text-sm font-bold mt-2">Seluruh Aliran Tercatat Aktif</p>
            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">Semua dana berpindah yang Anda lakukan melalui menu alih dana akan tercatat di histori mutasi global.</p>
          </div>
        </>
      ) : (
        <Card className="border-indigo-100 shadow-md bg-white">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <span className="text-xl">🔄</span>
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Formulir Pengalihan Alokasi Dana</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Memindahkan sebagian saldo antar sub-akun target berbeda</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span>🎉</span> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleExecuteMigration} className="space-y-4">
            {/* Akun Asal */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Pilih Sub-Akun Asal (Sumber Dana)</label>
              <select 
                value={sourceAccId}
                onChange={(e) => setSourceAccId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="">-- Pilih Akun Asal --</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.institution}) - Saldo: {fmtShort(a.balance)} [{a.goal}]
                  </option>
                ))}
              </select>
            </div>

            {/* Simbol Panah */}
            <div className="flex justify-center my-1">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                ↓
              </div>
            </div>

            {/* Akun Tujuan */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Pilih Sub-Akun Tujuan (Alokasi Baru)</label>
              <select 
                value={destAccId}
                onChange={(e) => setDestAccId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="">-- Pilih Akun Tujuan --</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.institution}) - Saldo: {fmtShort(a.balance)} [{a.goal}]
                  </option>
                ))}
              </select>
            </div>

            {/* Nominal */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Nominal Pengalihan (Rp)</label>
              <input 
                type="number"
                placeholder="Contoh: 2000000"
                value={migrateAmount}
                onChange={(e) => setMigrateAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Catatan (Optional)</label>
              <input 
                type="text"
                placeholder="Contoh: Mengalihkan dari Dana Darurat ke Dana Pendidikan semester ini"
                value={migrateNote}
                onChange={(e) => setMigrateNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold py-3 rounded-xl shadow-sm transition-colors mt-2">
              Lakukan Pengalihan Dana Sekarang →
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

// ─── IMPORT & RESET DATA PAGE ───────────────────────────────────────────────────
function ImportPage({ onResetData }) {
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: "" });
  const fileInputRef = useRef(null);

  const preview = [
    { date:"2026-05-01", account:"Jago Edu", category:"Income",   sub:"Gaji",         note:"Gaji Mei",    amount:"15.000.000", type:"Income" },
    { date:"2026-05-05", account:"BLU Operasional",  category:"Expense",  sub:"Makanan",      note:"Alfamart",    amount:"150.000",    type:"Expense" },
    { date:"2026-05-10", account:"Jago DD", category:"Transfer", sub:"Transfer-Out", note:"Top-up BLU",  amount:"2.000.000",  type:"Transfer" },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setStep(1);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleOpenConfirm = (type) => {
    setConfirmModal({ show: true, type });
  };

  const handleCloseConfirm = () => {
    setConfirmModal({ show: false, type: "" });
  };

  const handleExecuteReset = () => {
    onResetData(confirmModal.type);
    setConfirmModal({ show: false, type: "" });
  };

  return (
    <div className="space-y-5 animate-fade-in relative">
      <div>
        <h1 className="text-xl font-black text-slate-800">Import & Manajemen Data</h1>
        <p className="text-slate-400 text-xs mt-1">Upload mutasi baru atau bersihkan data agar tidak terjadi duplikasi</p>
      </div>

      {step === 0 && (
        <>
          {/* Input file sesungguhnya yang disembunyikan */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />

          <div 
            onDragOver={e=>{e.preventDefault();setDragging(true);}} 
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);setStep(1);}} 
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200
              ${dragging?"border-indigo-500 bg-indigo-50/50":"border-slate-300 hover:border-indigo-400 bg-white shadow-sm"}`}>
            <span className="text-5xl animate-bounce">📂</span>
            <p className="text-slate-800 font-bold text-sm">Klik untuk pilih file, atau lepas file di sini</p>
            <p className="text-slate-400 text-xs font-medium">Mendukung .xlsx, .xls, .csv</p>
          </div>
          
          <Card>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kolom yang Kompatibel</h3>
            <div className="flex flex-wrap gap-2">
              {["Tanggal","Akun","Kategori","Catatan","IDR/Nominal","Tipe"].map(col=>(
                <span key={col} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-indigo-600 font-mono font-bold">{col}</span>
              ))}
            </div>
          </Card>

          {/* 🧹 RESET & DATA MANAGEMENT CENTER ─── */}
          <Card className="border-rose-100 bg-rose-50/10">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xl">🧹</span>
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-widest">Pusat Reset & Pembersihan Data</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Hindari data ganda sebelum melakukan import file baru dengan membersihkan riwayat mutasi atau menyetel ulang saldo.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleOpenConfirm("clear-transactions")}
                className="w-full flex items-center justify-between bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 px-4 py-3 rounded-xl text-xs text-rose-600 font-bold transition-all shadow-sm">
                <span>Kosongkan Semua Riwayat Mutasi</span>
                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">Hanya Transaksi</span>
              </button>

              <button 
                onClick={() => handleOpenConfirm("zero-balances")}
                className="w-full flex items-center justify-between bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 px-4 py-3 rounded-xl text-xs text-rose-600 font-bold transition-all shadow-sm">
                <span>Setel Ulang Semua Saldo ke Rp 0 & Transaksi</span>
                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">Saldo + Mutasi</span>
              </button>

              <button 
                onClick={() => handleOpenConfirm("all")}
                className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl text-xs text-slate-700 font-bold transition-all border border-slate-200">
                <span>Reset Kembali ke Data Demo Awal</span>
                <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Default App</span>
              </button>
            </div>
          </Card>
        </>
      )}

      {step === 1 && (
        <>
          <Card className="border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-xl font-bold">✓</span>
              <div>
                <div className="text-sm font-bold text-emerald-800">File Berhasil Terbaca</div>
                <div className="text-xs text-slate-500 font-medium">mutasi_keuangan.xlsx · 45 Transaksi Terdeteksi</div>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Preview Pemetaan Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-bold">
                    {["Tanggal","Akun","Kategori","Catatan","Nominal","Tipe"].map(h=>(
                      <th key={h} className="text-left pb-2 pr-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600 font-medium">
                  {preview.map((r,i)=>(
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-3 whitespace-nowrap">{r.date}</td>
                      <td className="py-2.5 pr-3">{r.account}</td>
                      <td className="py-2.5 pr-3">{r.category}</td>
                      <td className="py-2.5 pr-3">{r.note}</td>
                      <td className="py-2.5 pr-3 font-bold text-slate-700">Rp {r.amount}</td>
                      <td className="py-2.5 pr-3">
                        <Badge color={r.type==="Income"?"#10b981":r.type==="Expense"?"#f43f5e":"#6366f1"}>{r.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="flex gap-3">
            <button onClick={()=>setStep(0)} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors">Batal</button>
            <button onClick={()=>setStep(2)} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors">Import Sekarang</button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm animate-fade-in">
          <span className="text-6xl">🎉</span>
          <h2 className="text-lg font-black text-slate-800">Import Sukses!</h2>
          <p className="text-slate-400 text-xs font-medium max-w-xs leading-relaxed">45 mutasi transaksi telah dikelompokkan otomatis ke dalam pos-pos target Anda.</p>
          <button onClick={()=>setStep(0)} className="mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors">Selesai</button>
        </div>
      )}

      {/* ⚠️ CUSTOM VISUAL CONFIRMATION MODAL ─── */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-slate-800">Konfirmasi Pembersihan Data</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {confirmModal.type === "all" && "Apakah Anda yakin ingin mereset kembali seluruh data aplikasi ke keadaan demo bawaan?"}
                {confirmModal.type === "clear-transactions" && "Apakah Anda yakin ingin menghapus seluruh riwayat mutasi transaksi?"}
                {confirmModal.type === "zero-balances" && "Apakah Anda yakin ingin mengosongkan riwayat mutasi DAN mengatur saldo seluruh akun Anda menjadi Rp 0?"}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors">
                Ya, Hapus
              </button>
              <button 
                onClick={handleCloseConfirm}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",    icon: "⊞", label: "Dashboard" },
  { id: "accounts",     icon: "🏦", label: "Akun" },
  { id: "transactions", icon: "📋", label: "Mutasi" },
  { id: "goals",        icon: "🎯", label: "Target" },
  { id: "transfer",     icon: "⇄",  label: "Transfer" },
  { id: "import",       icon: "📂", label: "Import" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Deklarasi State Utama agar data menjadi Dinamis
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [goals, setGoals] = useState(INITIAL_GOALS);

  // Kalkulasi dinamis saldo saat ini per Target Keuangan berdasarkan akun yang cocok
  const goalsWithComputedCurrent = useMemo(() => {
    return goals.map(g => {
      const relatedAccounts = accounts.filter(a => a.goal === g.name);
      const currentSum = relatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        ...g,
        current: currentSum
      };
    });
  }, [goals, accounts]);

  const handleSelectAccount = useCallback((acc) => { 
    setSelectedAccount(acc); 
    setPage("account-detail"); 
  }, []);

  const handleSelectGoal = useCallback((goal) => { 
    const computedGoal = goalsWithComputedCurrent.find(g => g.name === goal.name);
    setSelectedGoal(computedGoal || goal); 
    setPage("goal-detail"); 
  }, [goalsWithComputedCurrent]);

  const handleNav = (id) => {
    setSelectedAccount(null);
    setSelectedGoal(null);
    setPage(id);
  };

  const isGoalsActive = page === "goals" || page === "goal-detail";
  const isAccActive   = page === "accounts" || page === "account-detail";

  // Fitur Edit Target
  const handleUpdateTarget = (goalId, newTarget) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, target: newTarget } : g));
  };

  // Fitur Pengalihan Dana Antar Target (Dana Berpindah)
  const handleMigrateFunds = (sourceAccId, destAccId, amountVal, customNote) => {
    const amt = Number(amountVal);
    const sourceAcc = accounts.find(a => a.id === sourceAccId);
    if (!sourceAcc || sourceAcc.balance < amt) return false;

    // Kurangi saldo asal dan tambah saldo tujuan
    setAccounts(prev => prev.map(a => {
      if (a.id === sourceAccId) return { ...a, balance: a.balance - amt };
      if (a.id === destAccId) return { ...a, balance: a.balance + amt };
      return a;
    }));

    // Cari ID transaksi terbesar
    const maxId = transactions.length ? Math.max(...transactions.map(t => t.id)) : 0;
    const today = new Date().toISOString().split('T')[0];

    const destAccName = accounts.find(a => a.id === destAccId)?.name;

    const txOut = {
      id: maxId + 1,
      date: today,
      account_id: sourceAccId,
      category: "Transfer",
      sub: "Transfer-Out",
      type: "transfer",
      amount: -amt,
      note: customNote || `Dana Alokasi Berpindah ke ${destAccName}`,
      pair: destAccId
    };

    const txIn = {
      id: maxId + 2,
      date: today,
      account_id: destAccId,
      category: "Transfer",
      sub: "Transfer-In",
      type: "transfer",
      amount: amt,
      note: customNote || `Dana Alokasi Berpindah dari ${sourceAcc.name}`,
      pair: sourceAccId
    };

    setTransactions(prev => [txOut, txIn, ...prev]);
    return true;
  };

  // Fitur Reset Data
  const handleResetData = (type) => {
    if (type === "all") {
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
    } else if (type === "clear-transactions") {
      setTransactions([]);
    } else if (type === "zero-balances") {
      setAccounts(prev => prev.map(a => ({ ...a, balance: 0 })));
      setTransactions([]);
    }
  };

  // 📥 HANDLE EXPORT KHUSUS GROUP/KELOMPOK DANA YANG DIPILIH
  const handleExportGroup = (groupName, type) => {
    const isAll = groupName === "semua";
    const filteredAccs = isAll ? accounts : accounts.filter(a => a.goal === groupName);
    const filteredAccIds = filteredAccs.map(a => a.id);

    if (type === "transactions") {
      const headers = ["ID Transaksi", "Tanggal", "Nama Akun", "Institusi", "Tujuan Alokasi", "Kategori", "Subkategori", "Tipe", "Nominal (IDR)", "Catatan"];
      const csvRows = [headers.join(",")];
      const accMap = Object.fromEntries(accounts.map(a => [a.id, a]));

      const filteredTxs = transactions.filter(t => filteredAccIds.includes(t.account_id));

      filteredTxs.forEach(tx => {
        const acc = accMap[tx.account_id];
        const row = [
          tx.id,
          tx.date,
          acc ? acc.name : "-",
          acc ? acc.institution : "-",
          acc ? acc.goal : "-",
          tx.category,
          tx.sub,
          TYPE_LABEL[tx.type],
          tx.amount,
          tx.note || ""
        ];
        const escapedRow = row.map(val => `"${('' + val).replace(/"/g, '""')}"`);
        csvRows.push(escapedRow.join(","));
      });

      const safeFilename = isAll ? "semua_mutasi" : groupName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      downloadCSV(csvRows.join("\n"), `mutasi_kelompok_${safeFilename}.csv`);
    } else {
      // accounts
      const headers = ["ID Akun", "Nama Akun", "Institusi", "Tipe Akun", "Alokasi Target", "Saldo Saat Ini (IDR)"];
      const csvRows = [headers.join(",")];

      filteredAccs.forEach(acc => {
        const row = [
          acc.id,
          acc.name,
          acc.institution,
          acc.type,
          acc.goal,
          acc.balance
        ];
        const escapedRow = row.map(val => `"${('' + val).replace(/"/g, '""')}"`);
        csvRows.push(escapedRow.join(","));
      });

      const safeFilename = isAll ? "semua_saldo" : groupName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      downloadCSV(csvRows.join("\n"), `saldo_kelompok_${safeFilename}.csv`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-600 font-sans antialiased">
      {/* Header Bar */}
      <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-200/50 px-4 py-3.5 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl">💎</span>
          <span className="font-black text-slate-800 tracking-tight text-sm">FinTrack Pro</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Live Alokasi</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-4 pt-5 pb-28 max-w-lg mx-auto">
        {page === "dashboard"    && (
          <Dashboard 
            goalsWithComputedCurrent={goalsWithComputedCurrent} 
            onGoalClick={handleSelectGoal} 
            accounts={accounts}
            handleExportGroup={handleExportGroup}
          />
        )}
        {page === "accounts"     && (
          <Accounts 
            accounts={accounts} 
            onSelectAccount={handleSelectAccount} 
            transactions={transactions}
            handleExportAccounts={() => handleExportGroup("semua", "accounts")}
          />
        )}
        {page === "account-detail" && selectedAccount && (
          <AccountDetail 
            account={selectedAccount} 
            onBack={() => handleNav("accounts")} 
            transactions={transactions}
            accounts={accounts}
          />
        )}
        {page === "transactions" && (
          <Transactions 
            transactions={transactions} 
            accounts={accounts}
            handleExportTransactions={() => handleExportGroup("semua", "transactions")}
          />
        )}
        {page === "goals"        && (
          <Goals 
            goalsWithComputedCurrent={goalsWithComputedCurrent} 
            onSelectGoal={handleSelectGoal} 
            accounts={accounts}
          />
        )}
        {page === "goal-detail"  && selectedGoal && (
          <GoalDetail 
            goal={selectedGoal} 
            onBack={() => handleNav("goals")} 
            accounts={accounts}
            transactions={transactions}
            onUpdateTarget={handleUpdateTarget}
            handleExportGroup={handleExportGroup}
          />
        )}
        {page === "transfer"     && (
          <Transfer 
            accounts={accounts} 
            onMigrateFunds={handleMigrateFunds}
          />
        )}
        {page === "import"       && (
          <ImportPage 
            onResetData={handleResetData}
          />
        )}
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200/80 shadow-md z-30">
        <div className="flex max-w-lg mx-auto">
          {NAV.map(n => {
            const active = n.id === "accounts" ? isAccActive : n.id === "goals" ? isGoalsActive : page === n.id;
            return (
              <button key={n.id} onClick={() => handleNav(n.id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all duration-150 ${active ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                <span className="text-lg leading-none font-bold">{n.icon}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
