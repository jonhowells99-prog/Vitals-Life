import { useState, useMemo } from "react";

// ── Storage ──────────────────────────────────────────────────────────────────
function useLS(key, init) {
  const [v, sv] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = (val) => {
    const n = typeof val === "function" ? val(v) : val;
    sv(n); localStorage.setItem(key, JSON.stringify(n));
  };
  return [v, set];
}

// ── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  bg:       "#F7F8FA",
  white:    "#FFFFFF",
  surface:  "#F0F2F5",
  border:   "#E8ECF0",
  border2:  "#D8DDE5",
  text:     "#111827",
  sub:      "#6B7280",
  muted:    "#9CA3AF",
  accent:   "#222EFF",
  accentBg: "#EEF0FF",
  green:    "#00B37A",
  greenBg:  "#E6F7F2",
  red:      "#E8445A",
  redBg:    "#FDEEF1",
  amber:    "#F59E0B",
  amberBg:  "#FEF3C7",
  purple:   "#7C3AED",
  purpleBg: "#F3EFFE",
  shadow:   "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
};

const DEF_HEALTH = { steps: 7342, water: 5, sleep: 7.2, calories: 1840, hrv: 62, recovery: 74, weight: 175, rhr: 58 };
const DEF_INCOME = [
  { id: 1, label: "Salary", amount: 8500, frequency: "monthly", category: "Employment" },
  { id: 2, label: "Freelance", amount: 1200, frequency: "monthly", category: "Side Income" },
];
const DEF_EXPENSES = [
  { id: 1, label: "Rent", amount: 2400, frequency: "monthly", category: "Housing", fixed: true },
  { id: 2, label: "Groceries", amount: 400, frequency: "monthly", category: "Food", fixed: false },
  { id: 3, label: "Utilities", amount: 145, frequency: "monthly", category: "Housing", fixed: true },
  { id: 4, label: "Gym", amount: 95, frequency: "monthly", category: "Health", fixed: true },
  { id: 5, label: "Subscriptions", amount: 65, frequency: "monthly", category: "Entertainment", fixed: true },
  { id: 6, label: "Transport", amount: 200, frequency: "monthly", category: "Transport", fixed: false },
];
const DEF_TASKS = [
  { id: 1, text: "Review Q2 financial report", done: false, priority: "high", tag: "Finance" },
  { id: 2, text: "Schedule health checkup", done: false, priority: "med", tag: "Health" },
  { id: 3, text: "Renew car insurance", done: true, priority: "high", tag: "Admin" },
  { id: 4, text: "Book flights for conference", done: false, priority: "med", tag: "Work" },
  { id: 5, text: "Morning run 5km", done: true, priority: "low", tag: "Health" },
  { id: 6, text: "Update investment portfolio", done: false, priority: "high", tag: "Finance" },
];
const DEF_EVENTS = [
  { id: 1, title: "Board Meeting", day: 15, time: "9:00 AM", color: "#222EFF" },
  { id: 2, title: "Dentist", day: 17, time: "2:00 PM", color: "#E8445A" },
  { id: 3, title: "Client Dinner", day: 20, time: "7:30 PM", color: "#00B37A" },
  { id: 4, title: "Q2 Deadline", day: 23, time: "EOD", color: "#F59E0B" },
  { id: 5, title: "Portfolio Review", day: 27, time: "10:00 AM", color: "#7C3AED" },
];
const DEF_SIM = { principal: 10000, monthly: 500, rate: 10, years: 10 };

const today = new Date();
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
const FREQ = { monthly: 1, weekly: 4.33, biweekly: 2.17, annual: 1/12, quarterly: 1/3 };
const toMonthly = (a, f) => a * (FREQ[f] || 1);
const fmt = (n, d = 0) => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const CAT_COLOR = { Housing: "#222EFF", Food: "#F59E0B", Health: "#00B37A", Entertainment: "#7C3AED", Transport: "#06B6D4", Personal: "#E8445A", Employment: "#00B37A", "Side Income": "#06B6D4", Other: "#9CA3AF" };

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#222EFF" />
      <circle cx="20" cy="20" r="13" stroke="white" strokeWidth="2" strokeOpacity="0.25" fill="none" strokeDasharray="63" strokeDashoffset="16" strokeLinecap="round" transform="rotate(-210 20 20)" />
      <circle cx="20" cy="20" r="13" stroke="white" strokeWidth="2.5" fill="none" strokeDasharray="42" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-210 20 20)" />
      <circle cx="20" cy="20" r="3" fill="white" />
    </svg>
  );
}

function Ring({ pct, size = 88, stroke = 7, color, bg, children, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.78;
  const fill = (Math.min(pct, 100) / 100) * arc;
  const rot = 90 + 180 * 0.22;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg || "#E8ECF0"} strokeWidth={stroke} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform={`rotate(${rot} ${size/2} ${size/2})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" transform={`rotate(${rot} ${size/2} ${size/2})`} style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 6 }}>
        {children}
        {label && <div style={{ fontSize: 8, color: "#9CA3AF", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 1, fontWeight: 600 }}>{label}</div>}
      </div>
    </div>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "#FFFFFF", borderRadius: 20, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #E8ECF0", cursor: onClick ? "pointer" : "default", transition: "box-shadow .2s", ...style }}>{children}</div>
  );
}

function Pill({ label, color, bg }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: "3px 9px", borderRadius: 99, letterSpacing: 0.5 }}>{label}</span>;
}

function SLabel({ children, style = {} }) {
  return <div style={{ fontSize: 10, color: "#9CA3AF", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 14, ...style }}>{children}</div>;
}

function Divider() { return <div style={{ height: 1, background: "#E8ECF0", margin: "14px 0" }} />; }

const inputSt = { background: "#F7F8FA", border: "1.5px solid #E8ECF0", borderRadius: 12, padding: "11px 14px", color: "#111827", fontFamily: "'DM Sans', sans-serif", fontSize: 14, width: "100%", outline: "none" };
const primaryBtn = { background: "#222EFF", border: "none", borderRadius: 12, padding: "13px 20px", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", width: "100%" };
const ghostBtn = { background: "transparent", border: "1.5px solid #E8ECF0", borderRadius: 12, padding: "9px 16px", color: "#6B7280", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" };

function TabBar2({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", background: "#F0F2F5", borderRadius: 14, padding: 4, gap: 2, marginBottom: 22 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", background: active === t ? "#FFFFFF" : "transparent", color: active === t ? "#111827" : "#6B7280", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: active === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none", transition: "all .2s" }}>{t}</button>
      ))}
    </div>
  );
}

function Bar({ val, max, color }) {
  return (
    <div style={{ background: "#F0F2F5", borderRadius: 99, height: 5, overflow: "hidden" }}>
      <div style={{ background: color, height: 5, width: `${Math.min(100, (val/max)*100)}%`, borderRadius: 99, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function LineChart({ series, height = 120, xLabels }) {
  const W = 340, H = height, P = { t: 8, r: 8, b: 24, l: 38 };
  const allVals = series.flatMap(s => s.data);
  const minV = Math.min(0, ...allVals), maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const xOf = (i, len) => P.l + (i / (len - 1)) * (W - P.l - P.r);
  const yOf = v => P.t + (1 - (v - minV) / range) * (H - P.t - P.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, overflow: "visible" }}>
      {[0, 0.5, 1].map((f, i) => {
        const v = minV + range * f;
        const y = yOf(v);
        return (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="#E8ECF0" strokeWidth="1" />
            <text x={P.l - 5} y={y + 4} textAnchor="end" fontSize="8" fill="#9CA3AF" fontFamily="'DM Sans', sans-serif">{Math.abs(v) >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)}</text>
          </g>
        );
      })}
      {xLabels && xLabels.map((lbl, i) => (
        <text key={i} x={xOf(i, xLabels.length)} y={H - 6} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="'DM Sans', sans-serif">{lbl}</text>
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [xOf(i, s.data.length), yOf(v)]);
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
        const areaPath = `${path} L ${pts[pts.length-1][0]},${yOf(0)} L ${pts[0][0]},${yOf(0)} Z`;
        return (
          <g key={si}>
            {s.area && <path d={areaPath} fill={s.color} opacity="0.08" />}
            <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {s.dots && pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={s.color} stroke="#FFFFFF" strokeWidth="1.5" />)}
          </g>
        );
      })}
    </svg>
  );
}

function Dashboard({ setTab }) {
  const [health] = useLS("h", DEF_HEALTH);
  const [income] = useLS("income", DEF_INCOME);
  const [expenses] = useLS("expenses", DEF_EXPENSES);
  const [tasks] = useLS("tk", DEF_TASKS);
  const [events] = useLS("ev", DEF_EVENTS);
  const hour = today.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const totalIncome = income.reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0);
  const totalExp = expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const net = totalIncome - totalExp;
  const savePct = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;
  const doneTasks = tasks.filter(t => t.done).length;
  const taskPct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const nextEvt = events.filter(e => e.day >= today.getDate()).sort((a, b) => a.day - b.day)[0];
  const recovColor = health.recovery >= 67 ? "#00B37A" : health.recovery >= 34 ? "#F59E0B" : "#E8445A";
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>{today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>{greet} 👋</div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <SLabel>Daily Overview</SLabel>
        <div style={{ display: "flex", justifyContent: "space-around​​​​​​​​​​​​​​​​
