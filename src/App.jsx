import { useState, useMemo, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

// ─── MOCK DATA (SUDAH DIPECAH BERDASARKAN GOAL SEPERTI DI SPREADSHEET) ────────
const ACCOUNTS = [
  // 🛡️ Alokasi Dana Darurat
  { id: 1,  name: "JAGO Emergency",        institution: "Jago",         type: "Bank Digital",  goal: "Dana Darurat",        balance: 15_000_000, color: "#ef4444" },
  { id: 2,  name: "Bibit Reksadana (DD)",  institution: "Bibit",        type: "Reksa Dana",    goal: "Dana Darurat",        balance: 10_000_000, color: "#f87171" },
  { id: 3,  name: "Bibit Obligasi (DD)",   institution: "Bibit",        type: "Obligasi",      goal: "Dana Darurat",        balance: 15_000_000, color: "#fca5a5" },

  // 🎓 Alokasi Dana Pendidikan
  { id: 4,  name: "JAGO Sekolah",          institution: "Jago",         type: "Bank Digital",  goal: "Dana Pendidikan",     balance: 10_500_000, color: "#3b82f6" },
  { id: 5,  name: "Bibit Reksadana (Edu)", institution: "Bibit",        type: "Reksa Dana",    goal: "Dana Pendidikan",     balance: 8_400_000,  color: "#60a5fa" },
  { id: 6,  name: "Emas Logam Mulia",      institution: "Pluang",       type: "Emas",          goal: "Dana Pendidikan",     balance: 12_000_000, color: "#eab308" },
  { id: 7,  name: "Saham Bibit (Edu)",     institution: "Bibit",        type: "Saham",         goal: "Dana Pendidikan",     balance: 15_000_000, color: "#a855f7" },
  { id: 8,  name: "Saham GoTrade (Edu)",   institution: "GoTrade",      type: "Saham US",      goal: "Dana Pendidikan",     balance: 10_000_000, color: "#c084fc" },
  { id: 9,  name: "Crypto Indodax (Edu)",  institution: "Indodax",      type: "Crypto",        goal: "Dana Pendidikan",     balance: 5_000_000,  color: "#ec4899" },

  // 🏠 Alokasi Masa Depan / Rumah
  { id: 10, name: "Bibit (Masa Depan)",    institution: "Bibit",        type: "Reksa Dana",    goal: "Masa Depan / Rumah",  balance: 20_000_000, color: "#10b981" },
  { id: 11, name: "Line Deposito",         institution: "Line Bank",    type: "Deposito",      goal: "Masa Depan / Rumah",  balance: 30_000_000, color: "#34d399" },
  { id: 12, name: "OCBC NISP",             institution: "OCBC",         type: "Bank Swasta",   goal: "Masa Depan / Rumah",  balance: 50_000_000, color: "#059669" },

  // ✈️ Alokasi Dana Liburan
  { id: 13, name: "SeaBank Liburan",       institution: "SeaBank",      type: "Bank Digital",  goal: "Dana Liburan",        balance: 7_800_000,  color: "#f59e0b" },

  // 💵 Rekening Operasional (Tidak Di-lock ke Target Tertentu)
  { id: 14, name: "BLU Operasional",       institution: "BLU BCA",      type: "Bank Digital",  goal: "Operasional",         balance: 5_200_000,  color: "#6366f1" },
  { id: 15, name: "Shopee Pay",            institution: "Shopee",       type: "E-Wallet",      goal: "Operasional",         balance: 1_250_000,  color: "#14b8a6" },
];

const TRANSACTIONS_RAW = [
  // Januari 2026
  { id: 1,  date: "2026-01-05", account_id: 14, category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Januari" },
  { id: 2,  date: "2026-01-06", account_id: 1,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Top-up Emergency Fund", pair: 14 },
  { id: 3,  date: "2026-01-06", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Top-up Emergency Fund", pair: 1 },
  { id: 4,  date: "2026-01-08", account_id: 15, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Top-up Shopee Pay", pair: 14 },
  { id: 5,  date: "2026-01-08", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Top-up Shopee Pay", pair: 15 },
  { id: 6,  date: "2026-01-10", account_id: 14, category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -450_000, note: "Belanja Bulanan Alfamart" },
  { id: 7,  date: "2026-01-12", account_id: 10, category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Beli Bibit (Masa Depan)" },
  { id: 8,  date: "2026-01-15", account_id: 14, category: "Expense",   sub: "Transportasi", type: "expense",  amount:    -320_000, note: "Bensin + Tol" },
  { id: 9,  date: "2026-01-20", account_id: 4,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   2_500_000, note: "Dana Sekolah Anak", pair: 14 },
  { id: 10, date: "2026-01-20", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -2_500_000, note: "Dana Sekolah Anak", pair: 4 },
  { id: 11, date: "2026-01-25", account_id: 14, category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Listrik + WiFi" },

  // Februari 2026
  { id: 12, date: "2026-02-05", account_id: 14, category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Februari" },
  { id: 13, date: "2026-02-06", account_id: 1,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Tabungan Dana Darurat", pair: 14 },
  { id: 14, date: "2026-02-06", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Tabungan Dana Darurat", pair: 1 },
  { id: 15, date: "2026-02-10", account_id: 7,  category: "Investasi", sub: "Saham",        type: "invest",   amount:   5_000_000, note: "Beli BBCA Saham Bibit" },
  { id: 16, date: "2026-02-14", account_id: 13, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Nabung Liburan Khas", pair: 14 },
  { id: 17, date: "2026-02-14", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Nabung Liburan Khas", pair: 13 },
  { id: 18, date: "2026-02-20", account_id: 14, category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -600_000, note: "Makan Valentine" },
  { id: 19, date: "2026-02-25", account_id: 14, category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Listrik + Internet" },
  { id: 20, date: "2026-02-28", account_id: 5,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Top-up Bibit (Pendidikan)" },

  // Maret 2026
  { id: 21, date: "2026-03-05", account_id: 14, category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Maret" },
  { id: 22, date: "2026-03-07", account_id: 1,  category: "Expense",   sub: "Kesehatan",    type: "expense",  amount:  -2_500_000, note: "Klinik & Obat" },
  { id: 23, date: "2026-03-10", account_id: 6,  category: "Investasi", sub: "Emas",         type: "invest",   amount:   2_000_000, note: "Beli Emas Antam Pluang" },
  { id: 24, date: "2026-03-15", account_id: 14, category: "Expense",   sub: "Pendidikan",   type: "expense",  amount:    -750_000, note: "Kursus Online" },
  { id: 25, date: "2026-03-20", account_id: 3,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_000_000, note: "Top-up Bibit Obligasi DD", pair: 14 },
  { id: 26, date: "2026-03-20", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_000_000, note: "Top-up Bibit Obligasi DD", pair: 3 },
  { id: 27, date: "2026-03-25", account_id: 14, category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Listrik + Internet" },

  // April 2026
  { id: 28, date: "2026-04-05", account_id: 14, category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji April" },
  { id: 29, date: "2026-04-05", account_id: 14, category: "Income",    sub: "Bonus",        type: "income",   amount:   5_000_000, note: "Bonus Tahunan Q1" },
  { id: 30, date: "2026-04-08", account_id: 11, category: "Investasi", sub: "Deposito",     type: "invest",   amount:  10_000_000, note: "Deposito Line (Masa Depan)" },
  { id: 31, date: "2026-04-10", account_id: 8,  category: "Investasi", sub: "Saham",        type: "invest",   amount:   5_000_000, note: "Beli Saham GoTrade" },
  { id: 32, date: "2026-04-15", account_id: 13, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   2_000_000, note: "Nabung Liburan", pair: 14 },
  { id: 33, date: "2026-04-15", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -2_000_000, note: "Nabung Liburan", pair: 13 },
  { id: 34, date: "2026-04-20", account_id: 10, category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   3_000_000, note: "Top-up Bibit (Masa Depan)" },
  { id: 35, date: "2026-04-25", account_id: 14, category: "Expense",   sub: "Belanja",      type: "expense",  amount:  -1_200_000, note: "Baju Lebaran" },
  { id: 36, date: "2026-04-28", account_id: 14, category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -900_000, note: "Makan Keluarga Lebaran" },

  // Mei 2026
  { id: 37, date: "2026-05-05", account_id: 14, category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Mei" },
  { id: 38, date: "2026-05-06", account_id: 1,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_500_000, note: "Top-up Dana Darurat Jago", pair: 14 },
  { id: 39, date: "2026-05-06", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_500_000, note: "Top-up Dana Darurat Jago", pair: 1 },
  { id: 40, date: "2026-05-10", account_id: 4,  category: "Expense",   sub: "Pendidikan",   type: "expense",  amount:  -3_500_000, note: "Bayar SPP Sekolah Anak" },
  { id: 41, date: "2026-05-12", account_id: 7,  category: "Income",    sub: "Dividen",      type: "income",   amount:     800_000, note: "Dividen Saham BBCA" },
  { id: 42, date: "2026-05-15", account_id: 5,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Top-up Bibit (Pendidikan)" },
  { id: 43, date: "2026-05-18", account_id: 6,  category: "Investasi", sub: "Emas",         type: "invest",   amount:   1_000_000, note: "Beli Emas Antam Pluang" },
  { id: 44, date: "2026-05-20", account_id: 3,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Nabung Bibit Obligasi DD", pair: 14 },
  { id: 45, date: "2026-05-20", account_id: 14, category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Nabung Bibit Obligasi DD", pair: 3 },
  { id: 46, date: "2026-05-22", account_id: 14, category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -850_000, note: "Listrik, Air & Internet" },
];

const GOALS = [
  { id: 1, name: "Dana Darurat",       target: 50_000_000,  icon: "🛡️", color: "#ef4444", date: "2027-01-01" },
  { id: 2, name: "Dana Pendidikan",    target: 100_000_000, icon: "🎓", color: "#3b82f6", date: "2030-01-01" },
  { id: 3, name: "Masa Depan / Rumah", target: 250_000_000, icon: "🏠", color: "#10b981", date: "2028-06-01" },
  { id: 4, name: "Dana Liburan",       target: 20_000_000,  icon: "✈️", color: "#f59e0b", date: "2026-12-01" },
];

const MONTHLY_DATA = [
  { month: "Jan", income: 12_000_000, expense: 5_070_000, invest: 2_000_000, asset: 132_000_000 },
  { month: "Feb", income: 12_000_000, expense: 5_400_000, invest: 7_000_000, asset: 141_000_000 },
  { month: "Mar", income: 12_000_000, expense: 5_050_000, invest: 2_000_000, asset: 148_000_000 },
  { month: "Apr", income: 17_000_000, expense: 7_100_000, invest: 18_000_000, asset: 158_000_000 },
  { month: "Mei", income: 12_800_000, expense: 5_850_000, invest: 3_000_000, asset: 212_300_000 },
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

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 ${className}`}>{children}</div>
);

const Badge = ({ children, color }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ backgroundColor: color + "15", color }}>{children}</span>
);

const StatCard = ({ label, value, sub, icon, color }) => (
  <Card className="flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 animate-fade-in"
      style={{ backgroundColor: color + "15" }}>{icon}</div>
    <div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-lg font-extrabold text-slate-800">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  </Card>
);

// Reusable transaction row
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
          <div className="text-sm font-semibold text-slate-800">{tx.note}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-slate-400">{fmtDate(tx.date)}</span>
            {showAccount && acc && <>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">{acc.name}</span>
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
function GoalDetail({ goal, onBack }) {
  const accMap = useMemo(() => Object.fromEntries(ACCOUNTS.map(a => [a.id, a])), []);
  const [filterType, setFilterType] = useState("semua");

  // Akun yang terkait goal ini
  const relatedAccs = useMemo(() => ACCOUNTS.filter(a => a.goal === goal.name), [goal]);
  const relatedAccIds = useMemo(() => relatedAccs.map(a => a.id), [relatedAccs]);

  // Semua transaksi dari akun terkait
  const allTx = useMemo(() =>
    TRANSACTIONS_RAW
      .filter(t => relatedAccIds.includes(t.account_id))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [relatedAccIds]
  );

  const filtered = useMemo(() =>
    filterType === "semua" ? allTx : allTx.filter(t => t.type === filterType),
    [allTx, filterType]
  );

  // Ringkasan
  const totalMasuk  = allTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalKeluar = allTx.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const pct = Math.min(100, (goal.current / goal.target) * 100);

  // Chart saldo per bulan (estimasi)
  const monthlyChart = useMemo(() => {
    const bulan = ["Jan","Feb","Mar","Apr","Mei"];
    return bulan.map((m, i) => ({
      month: m,
      saldo: Math.round(goal.current * (0.6 + 0.1 * i)),
    }));
  }, [goal]);

  const filters = ["semua","income","expense","transfer","invest"];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
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

      {/* Progress card */}
      <div className="rounded-2xl p-5 border shadow-sm transition-all" style={{ borderColor: goal.color + "30", backgroundColor: goal.color + "08" }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Terkumpul Saat Ini</div>
            <div className="text-2xl font-black text-slate-800">{fmt(goal.current)}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">dari total target {fmt(goal.target)}</div>
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
function Goals({ goalsWithComputedCurrent, onSelectGoal }) {
  const totalTarget  = goalsWithComputedCurrent.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goalsWithComputedCurrent.reduce((s, g) => s + g.current, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Target Keuangan</h1>
        <p className="text-slate-400 text-xs mt-1">
          {goalsWithComputedCurrent.length} Target Terpecah · Klik kartu untuk mutasi detail
        </p>
      </div>

      {/* Ringkasan total */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Total Dana Terkumpul</div>
            <div className="text-2xl font-black text-indigo-900">{fmtShort(totalCurrent)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Kebutuhan</div>
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
          const remaining = g.target - g.current;
          const monthsLeft = Math.max(1, Math.ceil((new Date(g.date) - new Date()) / (1000*60*60*24*30)));
          const needed = remaining / monthsLeft;
          const relatedAccs = ACCOUNTS.filter(a => a.goal === g.name);
          const txCount = TRANSACTIONS_RAW.filter(t => relatedAccs.map(a=>a.id).includes(t.account_id)).length;

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
                  <div className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 font-semibold">
                    {txCount} Mutasi
                  </div>
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
                <span>Lihat mutasi transaksi</span>
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
function Dashboard({ goalsWithComputedCurrent, onGoalClick }) {
  const totalAsset     = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalInvest    = ACCOUNTS.filter(a => ["Reksa Dana","Saham","Emas","Deposito","Obligasi","Saham US","Crypto"].includes(a.type)).reduce((s,a)=>s+a.balance,0);
  const totalCash      = ACCOUNTS.filter(a => ["Bank Digital","E-Wallet","Bank Swasta"].includes(a.type)).reduce((s,a)=>s+a.balance,0);
  const totalEmergency = ACCOUNTS.filter(a => a.goal === "Dana Darurat").reduce((s,a)=>s+a.balance,0);

  const pieData = Object.entries(
    ACCOUNTS.reduce((acc, a) => { 
      if(a.goal !== "Operasional") {
        acc[a.goal] = (acc[a.goal]||0) + a.balance; 
      }
      return acc; 
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#a855f7","#ec4899","#14b8a6","#6366f1"];

  const insights = [
    { icon: "📈", text: "Alokasi reksadana, emas, & obligasi Anda tersebar di 3 pos target utama.", color: "#3b82f6" },
    { icon: "🛡️", text: "Dana Darurat di Jago & Bibit terakumulasi Rp 40 Jt (80% dari target).", color: "#ef4444" },
    { icon: "🎒", text: "Tabungan pendidikan Anda dipecah di Saham Bibit, GoTrade, & Crypto Indodax.", color: "#a855f7" },
    { icon: "🏠", text: "Target Rumah di OCBC, Line Bank, & Bibit terkumpul Rp 100 Jt.", color: "#10b981" },
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
        <StatCard label="Pos Dana Darurat" value={fmtShort(totalEmergency)} icon="🛡️" color="#ef4444" sub="80% dari target" />
      </div>

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
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="truncate">{d.name} ({fmtShort(d.value)})</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">💡 Analisa & Rekomendasi</h3>
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
function Accounts({ onSelectAccount }) {
  const grouped = ACCOUNTS.reduce((acc, a) => {
    const k = ["Bank Digital", "E-Wallet", "Bank Swasta"].includes(a.type) ? "Kas & Rekening Aktif" : "Portofolio Investasi & Aset";
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Daftar Akun Terpecah</h1>
        <p className="text-slate-400 text-xs mt-1">{ACCOUNTS.length} sub-akun alokasi terdaftar</p>
      </div>
      {Object.entries(grouped).map(([group, accs]) => (
        <div key={group} className="space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2">{group}</h2>
          <div className="space-y-2.5">
            {accs.map(acc => {
              const txCount = TRANSACTIONS_RAW.filter(t => t.account_id === acc.id).length;
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
                          <span className="text-xs text-slate-400 font-medium">{acc.institution}</span>
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

function AccountDetail({ account, onBack }) {
  const accMap = useMemo(() => Object.fromEntries(ACCOUNTS.map(a => [a.id, a])), []);
  const txs = TRANSACTIONS_RAW.filter(t => t.account_id === account.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const monthlyBal = useMemo(() => {
    const base = account.balance;
    const net = txs.reduce((s, t) => s + t.amount, 0);
    return ["Jan","Feb","Mar","Apr","Mei"].map((m, i) => ({
      month: m, saldo: base - net + (net / 5) * (i + 1)
    }));
  }, [account, txs]);

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
function Transactions() {
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("semua");
  const accMap = useMemo(() => Object.fromEntries(ACCOUNTS.map(a=>[a.id,a])), []);

  const filtered = TRANSACTIONS_RAW
    .filter(t => filter === "semua" || t.type === filter)
    .filter(t => month === "semua" || t.date.startsWith(month))
    .filter(t => search === "" || t.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Semua Transaksi</h1>
        <p className="text-slate-400 text-xs mt-1">{filtered.length} riwayat mutasi ditemukan</p>
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

// ─── TRANSFER ────────────────────────────────────────────────────────────────
function Transfer() {
  const accMap = useMemo(() => Object.fromEntries(ACCOUNTS.map(a=>[a.id,a])), []);
  const transfers = TRANSACTIONS_RAW
    .filter(t => t.type === "transfer" && t.amount > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Aliran Transfer</h1>
        <p className="text-slate-400 text-xs mt-1">Sirkulasi pemindahan dana antar akun Anda</p>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <p className="text-xs text-indigo-700 font-medium leading-relaxed">💡 Transfer antar akun <strong>tidak dihitung</strong> sebagai pengeluaran bulanan konsumtif, melainkan pemindahan alokasi aset.</p>
      </div>
      <div className="space-y-3.5">
        {transfers.map(tx => {
          const src = accMap[tx.pair];
          const dst = accMap[tx.account_id];
          return (
            <div key={tx.id} className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4">
              <div className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider">{fmtDate(tx.date)}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[9px] text-slate-400 font-semibold uppercase mb-0.5">Asal</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{src?.name ?? "–"}</div>
                  <div className="text-[9px] text-slate-500 font-medium mt-0.5">{src?.institution}</div>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0 px-1">
                  <div className="text-indigo-500 text-lg font-bold">→</div>
                  <div className="text-[11px] font-black text-indigo-600">{fmtShort(tx.amount)}</div>
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[9px] text-slate-400 font-semibold uppercase mb-0.5">Tujuan</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{dst?.name ?? "–"}</div>
                  <div className="text-[9px] text-slate-500 font-medium mt-0.5">{dst?.institution}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 font-medium border-t border-slate-50 pt-2">{tx.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── IMPORT ───────────────────────────────────────────────────────────────────
function ImportPage() {
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const preview = [
    { date:"2026-05-01", account:"JAGO Sekolah", category:"Income",   sub:"Gaji",         note:"Gaji Mei",    amount:"12.000.000", type:"Income" },
    { date:"2026-05-05", account:"BLU",  category:"Expense",  sub:"Makanan",      note:"Alfamart",    amount:"150.000",    type:"Expense" },
    { date:"2026-05-10", account:"JAGO Emergency", category:"Transfer", sub:"Transfer-Out", note:"Top-up BLU",  amount:"2.000.000",  type:"Transfer" },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setStep(1);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-slate-800">Import Data Transaksi</h1>
        <p className="text-slate-400 text-xs mt-1">Upload file CSV/Excel mutasi dari bank Anda</p>
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

  // Kalkulasi dinamis saldo saat ini per Target Keuangan berdasarkan akun yang cocok
  const goalsWithComputedCurrent = useMemo(() => {
    return GOALS.map(g => {
      const relatedAccounts = ACCOUNTS.filter(a => a.goal === g.name);
      const currentSum = relatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        ...g,
        current: currentSum
      };
    });
  }, []);

  const handleSelectAccount = useCallback((acc) => { 
    setSelectedAccount(acc); 
    setPage("account-detail"); 
  }, []);

  const handleSelectGoal = useCallback((goal) => { 
    // Ambil goal yang sudah berisi kalkulasi dinamis saldo saat ini
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

  return (
    <div className="bg-slate-50 min-h-screen text-slate-600 font-sans antialiased">
      {/* Header Bar */}
      <div className="sticky top-0 Pin-20 bg-white/90 backdrop-blur border-b border-slate-200/50 px-4 py-3.5 flex items-center justify-between shadow-sm z-30">
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
          />
        )}
        {page === "accounts"     && (
          <Accounts onSelectAccount={handleSelectAccount} />
        )}
        {page === "account-detail" && selectedAccount && (
          <AccountDetail account={selectedAccount} onBack={() => handleNav("accounts")} />
        )}
        {page === "transactions" && (
          <Transactions />
        )}
        {page === "goals"        && (
          <Goals 
            goalsWithComputedCurrent={goalsWithComputedCurrent} 
            onSelectGoal={handleSelectGoal} 
          />
        )}
        {page === "goal-detail"  && selectedGoal && (
          <GoalDetail goal={selectedGoal} onBack={() => handleNav("goals")} />
        )}
        {page === "transfer"     && (
          <Transfer />
        )}
        {page === "import"       && (
          <ImportPage />
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
