import { useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const ACCOUNTS = [
  { id: 1,  name: "JAGO Emergency",  institution: "Jago",     type: "Bank Digital",  goal: "Dana Darurat",    balance: 15_000_000, color: "#ef4444" },
  { id: 2,  name: "BLU Sekolah",     institution: "BLU BCA",  type: "Bank Digital",  goal: "Dana Pendidikan", balance: 10_500_000, color: "#3b82f6" },
  { id: 3,  name: "BLU Operasional", institution: "BLU BCA",  type: "Bank Digital",  goal: "Operasional",     balance: 5_200_000,  color: "#6366f1" },
  { id: 4,  name: "SeaBank Liburan", institution: "SeaBank",  type: "Bank Digital",  goal: "Dana Liburan",    balance: 7_800_000,  color: "#f59e0b" },
  { id: 5,  name: "Shopee Pay",      institution: "Shopee",   type: "E-Wallet",      goal: "Operasional",     balance: 1_250_000,  color: "#22c55e" },
  { id: 6,  name: "Bibit",           institution: "Bibit",    type: "Reksa Dana",    goal: "Reksa Dana",      balance: 28_400_000, color: "#a855f7" },
  { id: 7,  name: "Stockbit Saham",  institution: "Stockbit", type: "Saham",         goal: "Investasi Saham", balance: 42_600_000, color: "#ec4899" },
  { id: 8,  name: "Pluang Emas",     institution: "Pluang",   type: "Emas",          goal: "Emas",            balance: 12_000_000, color: "#d97706" },
  { id: 9,  name: "Deposito BCA",    institution: "BCA",      type: "Deposito",      goal: "Deposito",        balance: 30_000_000, color: "#0ea5e9" },
  { id: 10, name: "JAGO Pensiun",    institution: "Jago",     type: "Bank Digital",  goal: "Dana Pensiun",    balance: 9_750_000,  color: "#14b8a6" },
];

const TRANSACTIONS_RAW = [
  { id: 1,  date: "2026-01-05", account_id: 3,  category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Januari" },
  { id: 2,  date: "2026-01-06", account_id: 1,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Top-up Emergency Fund", pair: 3 },
  { id: 3,  date: "2026-01-06", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Top-up Emergency Fund", pair: 1 },
  { id: 4,  date: "2026-01-08", account_id: 5,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Top-up Shopee Pay", pair: 5 },
  { id: 5,  date: "2026-01-10", account_id: 3,  category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -450_000, note: "Groceries Alfamart" },
  { id: 6,  date: "2026-01-12", account_id: 6,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Top-up Bibit RDPU" },
  { id: 7,  date: "2026-01-15", account_id: 3,  category: "Expense",   sub: "Transportasi", type: "expense",  amount:    -320_000, note: "Bensin + Parkir" },
  { id: 8,  date: "2026-01-20", account_id: 2,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   2_500_000, note: "Dana Sekolah Semester 2", pair: 3 },
  { id: 9,  date: "2026-01-20", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -2_500_000, note: "Dana Sekolah Semester 2", pair: 2 },
  { id: 10, date: "2026-01-25", account_id: 3,  category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Listrik + Internet" },
  { id: 11, date: "2026-02-05", account_id: 3,  category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Februari" },
  { id: 12, date: "2026-02-06", account_id: 1,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_000_000, note: "Top-up Emergency Fund", pair: 3 },
  { id: 13, date: "2026-02-06", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_000_000, note: "Top-up Emergency Fund", pair: 1 },
  { id: 14, date: "2026-02-10", account_id: 7,  category: "Investasi", sub: "Saham",        type: "invest",   amount:   5_000_000, note: "Beli BBCA lot 10" },
  { id: 15, date: "2026-02-14", account_id: 4,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Nabung liburan", pair: 3 },
  { id: 16, date: "2026-02-14", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Nabung liburan", pair: 4 },
  { id: 17, date: "2026-02-20", account_id: 3,  category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -600_000, note: "Valentine dinner" },
  { id: 18, date: "2026-02-25", account_id: 3,  category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Listrik + Internet" },
  { id: 19, date: "2026-02-28", account_id: 6,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Top-up Bibit" },
  { id: 20, date: "2026-03-05", account_id: 3,  category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Maret" },
  { id: 21, date: "2026-03-07", account_id: 1,  category: "Expense",   sub: "Kesehatan",    type: "expense",  amount:  -2_500_000, note: "Biaya dokter & obat" },
  { id: 22, date: "2026-03-10", account_id: 8,  category: "Investasi", sub: "Emas",         type: "invest",   amount:   2_000_000, note: "Beli emas digital Pluang" },
  { id: 23, date: "2026-03-15", account_id: 3,  category: "Expense",   sub: "Pendidikan",   type: "expense",  amount:    -750_000, note: "Kursus online" },
  { id: 24, date: "2026-03-20", account_id: 10, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_000_000, note: "Nabung pensiun", pair: 3 },
  { id: 25, date: "2026-03-20", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_000_000, note: "Nabung pensiun", pair: 10 },
  { id: 26, date: "2026-03-25", account_id: 3,  category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -800_000, note: "Listrik + Internet" },
  { id: 27, date: "2026-04-05", account_id: 3,  category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji April" },
  { id: 28, date: "2026-04-05", account_id: 3,  category: "Income",    sub: "Bonus",        type: "income",   amount:   5_000_000, note: "Bonus Q1" },
  { id: 29, date: "2026-04-08", account_id: 9,  category: "Investasi", sub: "Deposito",     type: "invest",   amount:  10_000_000, note: "Perpanjang Deposito BCA 3 bulan" },
  { id: 30, date: "2026-04-10", account_id: 7,  category: "Investasi", sub: "Saham",        type: "invest",   amount:   5_000_000, note: "Beli TLKM + BMRI" },
  { id: 31, date: "2026-04-15", account_id: 4,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   2_000_000, note: "Nabung liburan", pair: 3 },
  { id: 32, date: "2026-04-15", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -2_000_000, note: "Nabung liburan", pair: 4 },
  { id: 33, date: "2026-04-20", account_id: 6,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   3_000_000, note: "Top-up Bibit RDS" },
  { id: 34, date: "2026-04-25", account_id: 3,  category: "Expense",   sub: "Belanja",      type: "expense",  amount:  -1_200_000, note: "Baju Lebaran" },
  { id: 35, date: "2026-04-28", account_id: 3,  category: "Expense",   sub: "Makanan",      type: "expense",  amount:    -900_000, note: "Makan-makan Lebaran" },
  { id: 36, date: "2026-05-05", account_id: 3,  category: "Income",    sub: "Gaji",         type: "income",   amount:  12_000_000, note: "Gaji Mei" },
  { id: 37, date: "2026-05-06", account_id: 1,  category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   3_500_000, note: "Top-up Emergency Fund", pair: 3 },
  { id: 38, date: "2026-05-06", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -3_500_000, note: "Top-up Emergency Fund", pair: 1 },
  { id: 39, date: "2026-05-10", account_id: 2,  category: "Expense",   sub: "Pendidikan",   type: "expense",  amount:  -3_500_000, note: "SPP + Ekskul anak" },
  { id: 40, date: "2026-05-12", account_id: 7,  category: "Income",    sub: "Dividen",      type: "income",   amount:     800_000, note: "Dividen BBCA Q1" },
  { id: 41, date: "2026-05-15", account_id: 6,  category: "Investasi", sub: "Reksa Dana",   type: "invest",   amount:   2_000_000, note: "Top-up Bibit" },
  { id: 42, date: "2026-05-18", account_id: 8,  category: "Investasi", sub: "Emas",         type: "invest",   amount:   1_000_000, note: "Beli emas digital" },
  { id: 43, date: "2026-05-20", account_id: 10, category: "Transfer",  sub: "Transfer-In",  type: "transfer", amount:   1_500_000, note: "Nabung pensiun", pair: 3 },
  { id: 44, date: "2026-05-20", account_id: 3,  category: "Transfer",  sub: "Transfer-Out", type: "transfer", amount:  -1_500_000, note: "Nabung pensiun", pair: 10 },
  { id: 45, date: "2026-05-22", account_id: 3,  category: "Expense",   sub: "Utilitas",     type: "expense",  amount:    -850_000, note: "Listrik + Internet + Air" },
];

const GOALS = [
  { id: 1, name: "Dana Darurat",    target: 50_000_000,  current: 15_000_000, date: "2027-01-01", icon: "🛡️", color: "#ef4444" },
  { id: 2, name: "Dana Pendidikan", target: 100_000_000, current: 10_500_000, date: "2030-01-01", icon: "🎓", color: "#3b82f6" },
  { id: 3, name: "Dana Liburan",    target: 20_000_000,  current: 7_800_000,  date: "2026-12-01", icon: "✈️", color: "#f59e0b" },
  { id: 4, name: "Dana Pensiun",    target: 500_000_000, current: 9_750_000,  date: "2045-01-01", icon: "🏖️", color: "#14b8a6" },
  { id: 5, name: "Investasi Saham", target: 100_000_000, current: 42_600_000, date: "2028-01-01", icon: "📈", color: "#ec4899" },
  { id: 6, name: "Reksa Dana",      target: 50_000_000,  current: 28_400_000, date: "2027-06-01", icon: "💼", color: "#a855f7" },
  { id: 7, name: "Emas",            target: 30_000_000,  current: 12_000_000, date: "2028-01-01", icon: "🥇", color: "#d97706" },
  { id: 8, name: "Deposito",        target: 50_000_000,  current: 30_000_000, date: "2027-01-01", icon: "🏦", color: "#0ea5e9" },
];

const MONTHLY_DATA = [
  { month: "Jan", income: 12_000_000, expense: 5_070_000, invest: 2_000_000, asset: 132_000_000 },
  { month: "Feb", income: 12_000_000, expense: 5_400_000, invest: 7_000_000, asset: 141_000_000 },
  { month: "Mar", income: 12_000_000, expense: 5_050_000, invest: 2_000_000, asset: 148_000_000 },
  { month: "Apr", income: 17_000_000, expense: 7_100_000, invest: 18_000_000, asset: 158_000_000 },
  { month: "Mei", income: 12_800_000, expense: 5_850_000, invest: 3_000_000, asset: 162_300_000 },
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

const TYPE_COLOR = { income: "#22c55e", expense: "#ef4444", transfer: "#6366f1", invest: "#a855f7" };
const TYPE_LABEL = { income: "Masuk", expense: "Keluar", transfer: "Transfer", invest: "Investasi" };
const TYPE_ICON  = { income: "↑", expense: "↓", transfer: "⇄", invest: "◉" };

const TOOLTIP_STYLE = {
  backgroundColor: "#111827", border: "1px solid #374151",
  borderRadius: "12px", padding: "10px 14px", color: "#f9fafb", fontSize: 13
};

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 ${className}`}>{children}</div>
);

const Badge = ({ children, color }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ backgroundColor: color + "22", color }}>{children}</span>
);

const StatCard = ({ label, value, sub, icon, color }) => (
  <Card className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
      style={{ backgroundColor: color + "22" }}>{icon}</div>
    <div>
      <div className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  </Card>
);

// Reusable transaction row
const TxRow = ({ tx, accMap, showAccount = true }) => {
  const acc = accMap[tx.account_id];
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: TYPE_COLOR[tx.type] + "22", color: TYPE_COLOR[tx.type] }}>
          {TYPE_ICON[tx.type]}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{tx.note}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500">{fmtDate(tx.date)}</span>
            {showAccount && acc && <>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-500">{acc.name}</span>
            </>}
            <Badge color={TYPE_COLOR[tx.type]}>{TYPE_LABEL[tx.type]}</Badge>
          </div>
        </div>
      </div>
      <div className={`text-sm font-bold shrink-0 ml-2 ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
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
  const relatedAccIds = useMemo(
    () => ACCOUNTS.filter(a => a.goal === goal.name).map(a => a.id),
    [goal]
  );
  const relatedAccs = ACCOUNTS.filter(a => a.goal === goal.name);

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
      saldo: Math.round(goal.current * (0.4 + 0.15 * i)),
    }));
  }, [goal]);

  const filters = ["semua","income","expense","transfer","invest"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-lg">
          ←
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goal.icon}</span>
            <h1 className="text-xl font-bold text-white">{goal.name}</h1>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            Target: {new Date(goal.date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Progress card */}
      <div className="rounded-2xl p-5 border" style={{ borderColor: goal.color + "44", backgroundColor: goal.color + "11" }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Terkumpul</div>
            <div className="text-2xl font-bold text-white">{fmtShort(goal.current)}</div>
            <div className="text-xs text-gray-400 mt-0.5">dari target {fmtShort(goal.target)}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</div>
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div className="h-2.5 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: goal.color }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5">
          <div className="text-xs text-gray-400 mb-1">Total Dana Masuk</div>
          <div className="text-base font-bold text-green-400">+{fmtShort(totalMasuk)}</div>
          <div className="text-xs text-gray-500 mt-0.5">{allTx.filter(t=>t.amount>0).length} transaksi</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5">
          <div className="text-xs text-gray-400 mb-1">Total Dana Keluar</div>
          <div className="text-base font-bold text-red-400">{fmtShort(totalKeluar)}</div>
          <div className="text-xs text-gray-500 mt-0.5">{allTx.filter(t=>t.amount<0).length} transaksi</div>
        </div>
      </div>

      {/* Akun terkait */}
      {relatedAccs.length > 0 && (
        <Card>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Akun Terkait</h3>
          <div className="space-y-2">
            {relatedAccs.map(acc => (
              <div key={acc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: acc.color + "22", color: acc.color }}>
                    {acc.name[0]}
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{acc.name}</div>
                    <div className="text-xs text-gray-500">{acc.institution} · {acc.type}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">{fmtShort(acc.balance)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Estimasi Pertumbuhan Dana</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={monthlyChart}>
            <defs>
              <linearGradient id={`grad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={goal.color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={goal.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmtShort(v), "Saldo"]} />
            <Area type="monotone" dataKey="saldo" stroke={goal.color} strokeWidth={2}
              fill={`url(#grad-${goal.id})`} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Filter + Transaksi */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Riwayat Transaksi ({filtered.length})
        </h3>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {filters.map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filterType === f ? "text-white" : "bg-gray-800 text-gray-400"}`}
              style={filterType === f ? { backgroundColor: goal.color } : {}}>
              {f === "semua" ? "Semua" : TYPE_LABEL[f]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Tidak ada transaksi untuk filter ini
          </div>
        ) : (
          <div className="space-y-2">
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
function Goals({ onSelectGoal }) {
  const totalTarget  = GOALS.reduce((s, g) => s + g.target, 0);
  const totalCurrent = GOALS.reduce((s, g) => s + g.current, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Target Keuangan</h1>
        <p className="text-gray-400 text-sm mt-1">
          {GOALS.length} tujuan · Tap untuk lihat detail & transaksi
        </p>
      </div>

      {/* Ringkasan total */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/30 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Terkumpul</div>
            <div className="text-xl font-bold text-white">{fmtShort(totalCurrent)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Total Target</div>
            <div className="text-xl font-bold text-indigo-300">{fmtShort(totalTarget)}</div>
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
          <div className="h-2 rounded-full bg-indigo-500"
            style={{ width: `${Math.min(100, (totalCurrent/totalTarget)*100).toFixed(1)}%` }} />
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">
          {((totalCurrent/totalTarget)*100).toFixed(1)}% dari semua target
        </div>
      </div>

      {/* Goal cards — clickable */}
      <div className="space-y-3">
        {GOALS.map(g => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          const remaining = g.target - g.current;
          const monthsLeft = Math.max(1, Math.ceil((new Date(g.date) - new Date()) / (1000*60*60*24*30)));
          const needed = remaining / monthsLeft;
          const relatedAccs = ACCOUNTS.filter(a => a.goal === g.name);
          const txCount = TRANSACTIONS_RAW.filter(t => relatedAccs.map(a=>a.id).includes(t.account_id)).length;

          return (
            <button key={g.id} onClick={() => onSelectGoal(g)}
              className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 transition-all active:scale-[0.99]">

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="text-base font-bold text-white">{g.name}</div>
                    <div className="text-xs text-gray-500">
                      {relatedAccs.length > 0
                        ? relatedAccs.map(a => a.name).join(", ")
                        : "Belum ada akun"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    {txCount} tx
                  </div>
                  <div className="text-lg font-bold" style={{ color: g.color }}>
                    {pct.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: g.color }} />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500 mb-0.5">Terkumpul</div>
                  <div className="font-bold text-white">{fmtShort(g.current)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-0.5">Sisa</div>
                  <div className="font-bold text-red-400">{fmtShort(remaining)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-0.5">Perlu/bln</div>
                  <div className="font-bold text-yellow-400">{fmtShort(needed)}</div>
                </div>
              </div>

              {/* Tap hint */}
              <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: g.color + "cc" }}>
                <span>Lihat transaksi</span>
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
function Dashboard({ onGoalClick }) {
  const totalAsset    = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalInvest   = ACCOUNTS.filter(a => ["Reksa Dana","Saham","Emas","Deposito"].includes(a.type)).reduce((s,a)=>s+a.balance,0);
  const totalCash     = ACCOUNTS.filter(a => ["Bank Digital","E-Wallet"].includes(a.type)).reduce((s,a)=>s+a.balance,0);
  const totalEmergency = ACCOUNTS.filter(a => a.goal === "Dana Darurat").reduce((s,a)=>s+a.balance,0);

  const pieData = Object.entries(
    ACCOUNTS.reduce((acc, a) => { acc[a.goal] = (acc[a.goal]||0) + a.balance; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#ef4444","#3b82f6","#f59e0b","#14b8a6","#ec4899","#a855f7","#22c55e","#d97706","#0ea5e9","#6366f1"];

  const insights = [
    { icon: "📈", text: "Total aset naik Rp 4,3 Jt dari bulan lalu", color: "#22c55e" },
    { icon: "🛡️", text: "Dana Darurat baru 30% dari target Rp 50 Jt", color: "#f59e0b" },
    { icon: "💼", text: "Bibit (Reksa Dana) tumbuh konsisten 5 bulan berturut-turut", color: "#a855f7" },
    { icon: "⚠️", text: "Pengeluaran terbesar Mei: Pendidikan Rp 3,5 Jt", color: "#ef4444" },
    { icon: "💰", text: "Dividen BBCA masuk Rp 800 Rb bulan ini", color: "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Keuangan</h1>
        <p className="text-gray-400 text-sm mt-1">Ringkasan aset & cashflow · Mei 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Aset"     value={fmtShort(totalAsset)}    icon="💎" color="#6366f1" sub="Semua akun & investasi" />
        <StatCard label="Total Investasi" value={fmtShort(totalInvest)}  icon="📈" color="#ec4899" sub="Saham, RD, Emas, Deposito" />
        <StatCard label="Total Cash"     value={fmtShort(totalCash)}     icon="💵" color="#22c55e" sub="Bank digital & e-wallet" />
        <StatCard label="Dana Darurat"   value={fmtShort(totalEmergency)} icon="🛡️" color="#ef4444" sub="30% dari target" />
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Pertumbuhan Aset 2026</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY_DATA}>
            <defs>
              <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill:"#6b7280", fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[fmtShort(v),"Total Aset"]} />
            <Area type="monotone" dataKey="asset" stroke="#6366f1" strokeWidth={2} fill="url(#assetGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Cashflow Masuk vs Keluar</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MONTHLY_DATA} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill:"#6b7280", fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,n)=>[fmtShort(v), n==="income"?"Pemasukan":n==="expense"?"Pengeluaran":"Investasi"]} />
            <Bar dataKey="income"  fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="invest"  fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-center">
          {[["#22c55e","Pemasukan"],["#ef4444","Pengeluaran"],["#6366f1","Investasi"]].map(([c,l])=>(
            <div key={l} className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
              {l}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Distribusi Aset per Tujuan</h3>
        <p className="text-xs text-gray-500 mb-3">Tap tujuan keuangan untuk lihat detail →</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
              onClick={(d) => {
                const goal = GOALS.find(g => g.name === d.name);
                if (goal) onGoalClick(goal);
              }}
              style={{ cursor: "pointer" }}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,n)=>[fmtShort(v),n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {pieData.map((d, i) => (
            <button key={d.name} onClick={() => { const g = GOALS.find(g=>g.name===d.name); if(g) onGoalClick(g); }}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors text-left">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="truncate">{d.name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">💡 Insight Otomatis</h3>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50">
              <span className="text-lg">{ins.icon}</span>
              <p className="text-sm text-gray-300 leading-snug">{ins.text}</p>
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
    const k = ["Bank Digital","E-Wallet"].includes(a.type) ? "Cash & Bank" : "Investasi & Aset";
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Akun & Saldo</h1>
        <p className="text-gray-400 text-sm mt-1">{ACCOUNTS.length} akun terdaftar</p>
      </div>
      {Object.entries(grouped).map(([group, accs]) => (
        <div key={group}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{group}</h2>
          <div className="space-y-2">
            {accs.map(acc => {
              const txCount = TRANSACTIONS_RAW.filter(t => t.account_id === acc.id).length;
              return (
                <button key={acc.id} onClick={() => onSelectAccount(acc)}
                  className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: acc.color+"22", color: acc.color }}>
                        {acc.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{acc.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{acc.institution}</span>
                          <Badge color={acc.color}>{acc.goal}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{fmtShort(acc.balance)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{txCount} transaksi</div>
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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-lg">←</button>
        <div>
          <h1 className="text-xl font-bold text-white">{account.name}</h1>
          <p className="text-gray-400 text-xs">{account.institution} · {account.type}</p>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="text-xs text-gray-400 mb-1">Saldo saat ini</div>
        <div className="text-3xl font-bold" style={{ color: account.color }}>{fmt(account.balance)}</div>
        <div className="mt-2"><Badge color={account.color}>{account.goal}</Badge></div>
      </div>
      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Estimasi Pertumbuhan Saldo</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={monthlyBal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#6b7280", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1_000_000}Jt`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[fmtShort(v),"Saldo"]} />
            <Line type="monotone" dataKey="saldo" stroke={account.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Riwayat Transaksi</h2>
        {txs.length === 0
          ? <p className="text-gray-500 text-sm text-center py-8">Belum ada transaksi</p>
          : <div className="space-y-2">{txs.map(tx => <TxRow key={tx.id} tx={tx} accMap={accMap} showAccount={false} />)}</div>
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaksi</h1>
        <p className="text-gray-400 text-sm mt-1">{filtered.length} transaksi ditemukan</p>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Cari transaksi..."
        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["semua","2026-01","2026-02","2026-03","2026-04","2026-05"].map(m => (
          <button key={m} onClick={()=>setMonth(m)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${month===m?"bg-indigo-600 text-white":"bg-gray-800 text-gray-400"}`}>
            {m==="semua"?"Semua":["Jan","Feb","Mar","Apr","Mei"][parseInt(m.split("-")[1])-1]}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["semua","income","expense","transfer","invest"].map(t => (
          <button key={t} onClick={()=>setFilter(t)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===t?"bg-indigo-600 text-white":"bg-gray-800 text-gray-400"}`}>
            {t==="semua"?"Semua":TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(tx => <TxRow key={tx.id} tx={tx} accMap={accMap} showAccount={true} />)}
        {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-10">Tidak ada transaksi</p>}
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Alur Transfer</h1>
        <p className="text-gray-400 text-sm mt-1">Perpindahan dana antar akun</p>
      </div>
      <Card className="bg-indigo-950/40 border-indigo-800/40">
        <p className="text-xs text-indigo-300">Transfer antar akun <strong>tidak dihitung</strong> sebagai pengeluaran konsumtif — hanya perpindahan aset.</p>
      </Card>
      <div className="space-y-3">
        {transfers.map(tx => {
          const src = accMap[tx.pair];
          const dst = accMap[tx.account_id];
          return (
            <div key={tx.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-3">{fmtDate(tx.date)}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-0.5">Dari</div>
                  <div className="text-sm font-semibold text-white">{src?.name ?? "–"}</div>
                  <div className="text-xs text-gray-500">{src?.institution}</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-indigo-400 text-xl">→</div>
                  <div className="text-xs font-bold text-indigo-300">{fmtShort(tx.amount)}</div>
                </div>
                <div className="flex-1 bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-0.5">Ke</div>
                  <div className="text-sm font-semibold text-white">{dst?.name ?? "–"}</div>
                  <div className="text-xs text-gray-500">{dst?.institution}</div>
                </div>
              </div>
              <div className="mt-2.5 text-xs text-gray-500">{tx.note}</div>
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
  const preview = [
    { date:"2026-05-01", account:"JAGO", category:"Income",   sub:"Gaji",         note:"Gaji Mei",    amount:"12.000.000", type:"Income" },
    { date:"2026-05-05", account:"BLU",  category:"Expense",  sub:"Makanan",      note:"Alfamart",    amount:"150.000",    type:"Expense" },
    { date:"2026-05-10", account:"JAGO", category:"Transfer", sub:"Transfer-Out", note:"Top-up BLU",  amount:"2.000.000",  type:"Transfer" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Import Data</h1>
        <p className="text-gray-400 text-sm mt-1">Upload file Excel/CSV transaksi keuangan</p>
      </div>
      {step === 0 && (
        <>
          <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);setStep(1);}} onClick={()=>setStep(1)}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all
              ${dragging?"border-indigo-500 bg-indigo-500/10":"border-gray-700 hover:border-gray-500 bg-gray-900"}`}>
            <span className="text-5xl">📂</span>
            <p className="text-white font-semibold text-sm">Drag & drop file, atau klik untuk upload</p>
            <p className="text-gray-500 text-xs">Mendukung .xlsx, .xls, .csv</p>
          </div>
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Format Kolom yang Didukung</h3>
            <div className="flex flex-wrap gap-2">
              {["Date","Account","Category","Subcategory","Note","IDR","Income/Expense","Amount","Currency"].map(col=>(
                <span key={col} className="px-2 py-1 bg-gray-800 rounded-lg text-xs text-indigo-300 font-mono">{col}</span>
              ))}
            </div>
          </Card>
        </>
      )}
      {step === 1 && (
        <>
          <Card className="border-green-700/50 bg-green-900/20">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <div className="text-sm font-semibold text-green-300">File berhasil diproses</div>
                <div className="text-xs text-gray-400">keuangan_2026.xlsx · 45 transaksi · 10 akun</div>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Preview Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    {["Tanggal","Akun","Kategori","Catatan","Nominal","Tipe"].map(h=>(
                      <th key={h} className="text-left pb-2 pr-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {preview.map((r,i)=>(
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="py-2 pr-3 whitespace-nowrap">{r.date}</td>
                      <td className="py-2 pr-3">{r.account}</td>
                      <td className="py-2 pr-3">{r.category}</td>
                      <td className="py-2 pr-3">{r.note}</td>
                      <td className="py-2 pr-3">Rp {r.amount}</td>
                      <td className="py-2 pr-3">
                        <Badge color={r.type==="Income"?"#22c55e":r.type==="Expense"?"#ef4444":"#6366f1"}>{r.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex gap-3">
            <button onClick={()=>setStep(0)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium">Batal</button>
            <button onClick={()=>setStep(2)} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Import Sekarang</button>
          </div>
        </>
      )}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-6xl">🎉</span>
          <h2 className="text-xl font-bold text-white">Import Berhasil!</h2>
          <p className="text-gray-400 text-sm">45 transaksi telah diimpor dan dikategorikan otomatis.</p>
          <button onClick={()=>setStep(0)} className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Selesai</button>
        </div>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",    icon: "⊞", label: "Dashboard" },
  { id: "accounts",     icon: "🏦", label: "Akun" },
  { id: "transactions", icon: "📋", label: "Transaksi" },
  { id: "goals",        icon: "🎯", label: "Target" },
  { id: "transfer",     icon: "⇄",  label: "Transfer" },
  { id: "import",       icon: "📂", label: "Import" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleSelectAccount = useCallback((acc) => { setSelectedAccount(acc); setPage("account-detail"); }, []);
  const handleSelectGoal    = useCallback((goal) => { setSelectedGoal(goal); setPage("goal-detail"); }, []);

  const handleNav = (id) => {
    setSelectedAccount(null);
    setSelectedGoal(null);
    setPage(id);
  };

  const isGoalsActive = page === "goals" || page === "goal-detail";
  const isAccActive   = page === "accounts" || page === "account-detail";

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans">
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💎</span>
          <span className="font-bold text-sm tracking-tight">FinTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">Live · Mei 2026</span>
        </div>
      </div>

      <div className="px-4 pt-5 pb-28 max-w-lg mx-auto">
        {page === "dashboard"    && <Dashboard onGoalClick={handleSelectGoal} />}
        {page === "accounts"     && <Accounts onSelectAccount={handleSelectAccount} />}
        {page === "account-detail" && selectedAccount && <AccountDetail account={selectedAccount} onBack={() => handleNav("accounts")} />}
        {page === "transactions" && <Transactions />}
        {page === "goals"        && <Goals onSelectGoal={handleSelectGoal} />}
        {page === "goal-detail"  && selectedGoal && <GoalDetail goal={selectedGoal} onBack={() => handleNav("goals")} />}
        {page === "transfer"     && <Transfer />}
        {page === "import"       && <ImportPage />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur border-t border-gray-800/50 z-20">
        <div className="flex max-w-lg mx-auto">
          {NAV.map(n => {
            const active = n.id === "accounts" ? isAccActive : n.id === "goals" ? isGoalsActive : page === n.id;
            return (
              <button key={n.id} onClick={() => handleNav(n.id)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${active ? "text-indigo-400" : "text-gray-600 hover:text-gray-400"}`}>
                <span className="text-lg leading-none">{n.icon}</span>
                <span className="text-[10px] font-medium">{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
