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
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          {[
            { pct: health.recovery, label: "Recovery", val: `${health.recovery}%`, color: recovColor, tab: 1 },
            { pct: (health.steps / 10000) * 100, label: "Steps", val: `${(health.steps/1000).toFixed(1)}k`, color: "#F59E0B", tab: 1 },
            { pct: savePct, label: "Saved", val: `${savePct}%`, color: "#00B37A", tab: 2 },
            { pct: taskPct, label: "Tasks", val: `${taskPct}%`, color: "#222EFF", tab: 4 },
          ].map((r, i) => (
            <div key={i} onClick={() => setTab(r.tab)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Ring pct={r.pct} size={72} stroke={6} color={r.color} bg="#E8ECF0" label={r.label}>
                <div style={{ fontSize: 14, fontWeight: 800, color: r.color, lineHeight: 1 }}>{r.val}</div>
              </Ring>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }} onClick={() => setTab(2)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <SLabel style={{ marginBottom: 4 }}>This Month</SLabel>
            <div style={{ fontSize: 30, fontWeight: 800, color: net >= 0 ? "#00B37A" : "#E8445A", letterSpacing: -1 }}>{net >= 0 ? "+" : "-"}{fmt(net)}</div>
          </div>
          <Pill label={net >= 0 ? `${savePct}% saved` : "Deficit"} color={net >= 0 ? "#00B37A" : "#E8445A"} bg={net >= 0 ? "#E6F7F2" : "#FDEEF1"} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "#E6F7F2", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#00B37A", fontWeight: 700, marginBottom: 2 }}>INCOME</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#00B37A" }}>{fmt(totalIncome)}</div>
          </div>
          <div style={{ flex: 1, background: "#FDEEF1", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#E8445A", fontWeight: 700, marginBottom: 2 }}>EXPENSES</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#E8445A" }}>{fmt(totalExp)}</div>
          </div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Card onClick={() => setTab(1)}>
          <SLabel style={{ marginBottom: 12 }}>Health</SLabel>
          {[{ l: "HRV", v: `${health.hrv}ms`, c: "#222EFF" }, { l: "Sleep", v: `${health.sleep}h`, c: "#7C3AED" }, { l: "RHR", v: `${health.rhr}bpm`, c: "#E8445A" }].map(m => (
            <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{m.l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: m.c }}>{m.v}</div>
            </div>
          ))}
        </Card>
        <Card onClick={() => setTab(3)}>
          <SLabel style={{ marginBottom: 12 }}>Next Up</SLabel>
          {nextEvt ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4, lineHeight: 1.3 }}>{nextEvt.title}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>{MONTHS[today.getMonth()]} {nextEvt.day} · {nextEvt.time}</div>
              <div style={{ width: 24, height: 3, borderRadius: 99, background: nextEvt.color }} />
            </div>
          ) : <div style={{ fontSize: 12, color: "#9CA3AF" }}>No upcoming events</div>}
        </Card>
      </div>
      <Card onClick={() => setTab(4)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SLabel style={{ marginBottom: 0 }}>Priority Tasks</SLabel>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>{tasks.length - doneTasks} remaining</div>
        </div>
        {tasks.filter(t => !t.done && t.priority === "high").slice(0, 3).map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8445A", flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: "#111827", flex: 1 }}>{t.text}</div>
            <Pill label={t.tag} color="#6B7280" bg="#F0F2F5" />
          </div>
        ))}
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{doneTasks} of {tasks.length} complete</div>
          <Bar val={doneTasks} max={tasks.length || 1} color="#222EFF" />
        </div>
      </Card>
    </div>
  );
}

function HealthPage() {
  const [h, setH] = useLS("h", DEF_HEALTH);
  const [editing, setEditing] = useState(null);
  const [tmp, setTmp] = useState("");
  const edit = (k) => { setEditing(k); setTmp(h[k]); };
  const save = (k) => { setH(v => ({ ...v, [k]: parseFloat(tmp) || v[k] })); setEditing(null); };
  const recovColor = h.recovery >= 67 ? "#00B37A" : h.recovery >= 34 ? "#F59E0B" : "#E8445A";
  const wkHRV = [55, 60, 58, 65, 62, 68, 62];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#222EFF", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Health & Fitness</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>Your Vitals</div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <SLabel>Biometrics</SLabel>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 8 }}>
          {[
            { k: "recovery", pct: h.recovery, label: "Recovery", val: `${h.recovery}%`, color: recovColor },
            { k: "hrv", pct: h.hrv, label: "HRV", val: `${h.hrv}ms`, color: "#222EFF" },
            { k: "sleep", pct: (h.sleep / 9) * 100, label: "Sleep", val: `${h.sleep}h`, color: "#7C3AED" },
          ].map(r => (
            <div key={r.k} onClick={() => edit(r.k)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
              <Ring pct={r.pct} size={82} stroke={7} color={r.color} bg="#E8ECF0" label={r.label}>
                {editing === r.k
                  ? <input autoFocus type="number" value={tmp} onChange={e => setTmp(e.target.value)} onBlur={() => save(r.k)} onKeyDown={e => e.key === "Enter" && save(r.k)} style={{ width: 50, textAlign: "center", background: "transparent", border: "none", borderBottom: `2px solid ${r.color}`, color: r.color, fontSize: 14, fontWeight: 800, outline: "none" }} />
                  : <div style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.val}</div>}
              </Ring>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF" }}>Tap any ring to update</div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <SLabel>Daily Metrics</SLabel>
        {[
          { k: "steps", l: "Steps", v: h.steps, goal: 10000, unit: "", color: "#F59E0B" },
          { k: "water", l: "Hydration", v: h.water, goal: 8, unit: " gl", color: "#222EFF" },
          { k: "calories", l: "Calories", v: h.calories, goal: 2000, unit: " kcal", color: "#E8445A" },
          { k: "weight", l: "Weight", v: h.weight || 175, goal: 180, unit: " lbs", color: "#00B37A" },
        ].map((m, i, arr) => (
          <div key={m.k} style={{ marginBottom: i < arr.length - 1 ? 16 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{m.l}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: m.color, cursor: "pointer" }} onClick={() => edit(m.k)}>
                  {editing === m.k
                    ? <input autoFocus type="number" value={tmp} onChange={e => setTmp(e.target.value)} onBlur={() => save(m.k)} onKeyDown={e => e.key === "Enter" && save(m.k)} style={{ width: 70, textAlign: "right", background: "transparent", border: "none", borderBottom: `2px solid ${m.color}`, color: m.color, fontSize: 14, fontWeight: 800, outline: "none" }} />
                    : `${m.v.toLocaleString()}${m.unit}`}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>/ {m.goal.toLocaleString()}</div>
              </div>
            </div>
            <Bar val={m.v} max={m.goal} color={m.color} />
          </div>
        ))}
      </Card>
      <Card>
        <SLabel>7-Day HRV Trend</SLabel>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64 }}>
          {wkHRV.map((v, i) => {
            const isToday = i === wkHRV.length - 1;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: isToday ? "#222EFF" : "#F0F2F5", borderRadius: "4px 4px 0 0", height: `${(v / Math.max(...wkHRV)) * 50}px`, transition: "height 1s" }} />
                <div style={{ fontSize: 8, color: isToday ? "#222EFF" : "#9CA3AF", fontWeight: isToday ? 700 : 400 }}>{["M","T","W","T","F","S","T"][i]}</div>
              </div>
            );
          })}
        </div>
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#6B7280" }}>7-day average</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#222EFF" }}>{Math.round(wkHRV.reduce((a, b) => a + b, 0) / wkHRV.length)}ms</div>
        </div>
      </Card>
    </div>
  );
}

function FinancePage() {
  const [income, setIncome] = useLS("income", DEF_INCOME);
  const [expenses, setExpenses] = useLS("expenses", DEF_EXPENSES);
  const [sim, setSim] = useLS("sim", DEF_SIM);
  const [activeTab, setActiveTab] = useState("Cash Flow");
  const [showAdd, setShowAdd] = useState(null);
  const [form, setForm] = useState({ label: "", amount: "", frequency: "monthly", category: "Other", fixed: false });
  const totalIncome = income.reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0);
  const totalExp = expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const net = totalIncome - totalExp;
  const savePct = totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(1) : 0;
  const forecastMonths = Array(6).fill(0).map((_, i) => MONTHS[(today.getMonth() + i) % 12]);
  const forecastData = [
    { data: forecastMonths.map(() => totalIncome), color: "#00B37A", area: true },
    { data: forecastMonths.map(() => totalExp), color: "#E8445A", area: true },
    { data: forecastMonths.map((_, i) => net * (i + 1)), color: "#222EFF", dots: true },
  ];
  const catTotals = {};
  expenses.forEach(e => { const m = toMonthly(e.amount, e.frequency); catTotals[e.category] = (catTotals[e.category] || 0) + m; });
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const saveForm = (type) => {
    if (!form.label || !form.amount) return;
    const item = { id: Date.now(), label: form.label, amount: parseFloat(form.amount), frequency: form.frequency, category: form.category };
    if (type === "income") setIncome(v => [...v, item]);
    else setExpenses(v => [...v, { ...item, fixed: form.fixed }]);
    setForm({ label: "", amount: "", frequency: "monthly", category: "Other", fixed: false });
    setShowAdd(null);
  };
  const compute = (p, m, r, y) => {
    const mr = (r / 100) / 12;
    return Array(y).fill(0).map((_, i) => {
      const months = (i + 1) * 12;
      const fv = p * Math.pow(1 + mr, months) + m * ((Math.pow(1 + mr, months) - 1) / mr);
      const contrib = p + m * months;
      return { year: i + 1, value: fv, contributions: contrib, gains: fv - contrib };
    });
  };
  const simData = useMemo(() => compute(sim.principal, sim.monthly, sim.rate, sim.years), [sim]);
  const final = simData[simData.length - 1] || {};
  const xLabels = simData.map(d => `Y${d.year}`).filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 5)) === 0 || i === a.length - 1);
  const SliderRow = ({ label, value, min, max, step, format, onChange, color }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: "#6B7280" }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color }}>{format(value)}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
    </div>
  );
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#222EFF", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Finance</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>Financial Center</div>
      </div>
      <TabBar2 tabs={["Cash Flow", "Investments"]} active={activeTab} onChange={setActiveTab} />
      {activeTab === "Cash Flow" && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <SLabel style={{ marginBottom: 4 }}>Net Monthly</SLabel>
                <div style={{ fontSize: 38, fontWeight: 800, color: net >= 0 ? "#00B37A" : "#E8445A", letterSpacing: -1 }}>{net >= 0 ? "+" : "-"}{fmt(Math.abs(net))}</div>
              </div>
              <Ring pct={parseFloat(savePct)} size={72} stroke={6} color={net >= 0 ? "#00B37A" : "#E8445A"} bg="#E8ECF0" label="Saved">
                <div style={{ fontSize: 14, fontWeight: 800, color: net >= 0 ? "#00B37A" : "#E8445A" }}>{savePct}%</div>
              </Ring>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#E6F7F2", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "#00B37A", fontWeight: 700, marginBottom: 3 }}>INCOME</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#00B37A" }}>{fmt(totalIncome)}</div>
              </div>
              <div style={{ background: "#FDEEF1", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "#E8445A", fontWeight: 700, marginBottom: 3 }}>EXPENSES</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#E8445A" }}>{fmt(totalExp)}</div>
              </div>
            </div>
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <SLabel>6-Month Forecast</SLabel>
            <LineChart series={forecastData} xLabels={forecastMonths} height={120} />
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
              {[{ l: "Income", c: "#00B37A" }, { l: "Expenses", c: "#E8445A" }, { l: "Cumulative", c: "#222EFF" }].map(l => (
                <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 2, background: l.c, borderRadius: 99 }} />
                  <div style={{ fontSize: 9, color: "#9CA3AF" }}>{l.l}</div>
                </div>
              ))}
            </div>
            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "#6B7280" }}>6-month projected surplus</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: net >= 0 ? "#00B37A" : "#E8445A" }}>{net >= 0 ? "+" : "-"}{fmt(Math.abs(net * 6))}</div>
            </div>
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <SLabel>Spending by Category</SLabel>
            {topCats.map(([cat, amt]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLOR[cat] || "#9CA3AF", flexShrink: 0 }} />
                    <div style={{ fontSize: 13, color: "#6B7280" }}>{cat}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: CAT_COLOR[cat] || "#9CA3AF" }}>{fmt(amt)}<span style={{ fontSize: 10, color: "#9CA3AF" }}> /mo</span></div>
                </div>
                <Bar val={amt} max={totalExp} color={CAT_COLOR[cat] || "#9CA3AF"} />
              </div>
            ))}
          </Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SLabel style={{ marginBottom: 0 }}>Income</SLabel>
            <button style={ghostBtn} onClick={() => setShowAdd(showAdd === "income" ? null : "income")}>{showAdd === "income" ? "Cancel" : "+ Add"}</button>
          </div>
          {showAdd === "income" && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input style={inputSt} placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                <input style={inputSt} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                <select style={inputSt} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {["monthly","weekly","biweekly","quarterly","annual"].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
                <input style={inputSt} placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <button style={{ ...primaryBtn, background: "#00B37A" }} onClick={() => saveForm("income")}>Add Income Source</button>
            </Card>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {income.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", border: "1px solid #E8ECF0", borderRadius: 14, padding: "13px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E6F7F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>↑</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.category} · {item.frequency}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#00B37A" }}>+{fmt(item.amount)}</div>
                <button onClick={() => setIncome(v => v.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SLabel style={{ marginBottom: 0 }}>Expenses</SLabel>
            <button style={ghostBtn} onClick={() => setShowAdd(showAdd === "expense" ? null : "expense")}>{showAdd === "expense" ? "Cancel" : "+ Add"}</button>
          </div>
          {showAdd === "expense" && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input style={inputSt} placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                <input style={inputSt} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                <select style={inputSt} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {["monthly","weekly","biweekly","quarterly","annual"].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
                <input style={inputSt} placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                <div onClick={() => setForm(f => ({ ...f, fixed: !f.fixed }))} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.fixed ? "#222EFF" : "#E8ECF0"}`, background: form.fixed ? "#222EFF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>{form.fixed ? "✓" : ""}</div>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Fixed expense</span>
              </label>
              <button style={{ ...primaryBtn, background: "#E8445A" }} onClick={() => saveForm("expense")}>Add Expense</button>
            </Card>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {expenses.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", border: "1px solid #E8ECF0", borderRadius: 14, padding: "13px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FDEEF1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>↓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.category} · {item.frequency}</div>
                    {item.fixed && <Pill label="Fixed" color="#222EFF" bg="#EEF0FF" />}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#E8445A" }}>-{fmt(item.amount)}</div>
                <button onClick={() => setExpenses(v => v.filter(e => e.id !== item.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === "Investments" && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <SLabel>Projected at Year {sim.years}</SLabel>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#222EFF", letterSpacing: -1, marginBottom: 4 }}>{fmt(final.value || 0)}</div>
            <Divider />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[{ l: "Invested", v: fmt(final.contributions || 0), c: "#6B7280" }, { l: "Gains", v: fmt(final.gains || 0), c: "#00B37A" }, { l: "Return", v: `${final.contributions > 0 ? (((final.value - final.contributions) / final.contributions) * 100).toFixed(0) : 0}%`, c: "#222EFF" }].map(s => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <SLabel>Growth Projection</SLabel>
            <LineChart series={[{ data: simData.map(d => d.contributions), color: "#D8DDE5" }, { data: simData.map(d => d.value), color: "#222EFF", area: true }]} xLabels={xLabels} height={130} />
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
              {[{ l: "Contributions", c: "#D8DDE5" }, { l: "Portfolio Value", c: "#222EFF" }].map(l => (
                <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 2, background: l.c, borderRadius: 99 }} />
                  <div style={{ fontSize: 9, color: "#9CA3AF" }}>{l.l}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
            {[{ l: "Conservative", r: 5, icon: "🛡️" }, { l: "S&P Avg", r: 10, icon: "📈" }, { l: "Aggressive", r: 15, icon: "🚀" }].map(p => (
              <button key={p.l} onClick={() => setSim(s => ({ ...s, rate: p.r }))} style={{ background: sim.rate === p.r ? "#EEF0FF" : "#FFFFFF", border: `1.5px solid ${sim.rate === p.r ? "#222EFF" : "#E8ECF0"}`, borderRadius: 14, padding: "12px 6px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{p.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: sim.rate === p.r ? "#222EFF" : "#6B7280" }}>{p.l}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: sim.rate === p.r ? "#222EFF" : "#111827" }}>{p.r}%</div>
              </button>
            ))}
          </div>
          <Card style={{ marginBottom: 14 }}>
            <SLabel>Adjust Parameters</SLabel>
            <SliderRow label="Initial Investment" value={sim.principal} min={0} max={100000} step={500} format={v => fmt(v)} onChange={v => setSim(s => ({ ...s, principal: v }))} color="#222EFF" />
            <SliderRow label="Monthly Contribution" value={sim.monthly} min={0} max={5000} step={50} format={v => fmt(v)} onChange={v => setSim(s => ({ ...s, monthly: v }))} color="#00B37A" />
            <SliderRow label="Annual Return Rate" value={sim.rate} min={1} max={30} step={0.5} format={v => `${v}%`} onChange={v => setSim(s => ({ ...s, rate: v }))} color="#F59E0B" />
            <SliderRow label="Time Horizon" value={sim.years} min={1} max={40} step={1} format={v => `${v} yr`} onChange={v => setSim(s => ({ ...s, years: v }))} color="#7C3AED" />
          </Card>
          <Card>
            <SLabel>Milestones</SLabel>
            {[10000, 50000, 100000, 250000, 500000, 1000000].map(target => {
              const hit = simData.find(d => d.value >= target);
              return (
                <div key={target} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: hit ? "#E6F7F2" : "#F0F2F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{hit ? "✓" : "·"}</div>
                  <div style={{ flex: 1, fontSize: 13, color: hit ? "#111827" : "#9CA3AF", fontWeight: hit ? 600 : 400 }}>{fmt(target)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: hit ? "#00B37A" : "#9CA3AF" }}>{hit ? `Year ${hit.year}` : "Out of range"}</div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

function CalendarPage() {
  const [events, setEvents] = useLS("ev", DEF_EVENTS);
  const [sel, setSel] = useState(today.getDate());
  const [form, setForm] = useState({ title: "", time: "" });
  const [show, setShow] = useState(false);
  const evtDays = new Set(events.map(e => e.day));
  const dayEvts = events.filter(e => e.day === sel);
  const upcoming = events.filter(e => e.day >= today.getDate()).sort((a, b) => a.day - b.day);
  const EVT_COLORS = ["#222EFF", "#00B37A", "#E8445A", "#F59E0B", "#7C3AED"];
  const addEvt = () => {
    if (!form.title) return;
    setEvents(ev => [...ev, { id: Date.now(), title: form.title, day: sel, time: form.time || "All day", color: EVT_COLORS[Math.floor(Math.random() * EVT_COLORS.length)] }]);
    setForm({ title: "", time: "" });
    setShow(false);
  };
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#222EFF", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Calendar</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>{MONTHS[today.getMonth()]} {today.getFullYear()}</div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, textAlign: "center" }}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, paddingBottom: 10, letterSpacing: 0.5 }}>{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => <div key={`g${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate();
            const isSel = day === sel;
            const evtColor = events.find(e => e.day === day)?.color;
            return (
              <div key={day} onClick={() => setSel(day)} style={{ padding: "8px 2px", borderRadius: 10, cursor: "pointer", background: isSel ? "#222EFF" : isToday ? "#EEF0FF" : "transparent", color: isSel ? "#fff" : isToday ? "#222EFF" : "#111827", fontWeight: isToday || isSel ? 700 : 400, fontSize: 13, transition: "all .15s", position: "relative" }}>
                {day}
                {evtDays.has(day) && !isSel && <div style={{ width: 4, height: 4, borderRadius: "50%", background: evtColor || "#222EFF", margin: "2px auto 0" }} />}
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SLabel style={{ marginBottom: 0 }}>{MONTHS[today.getMonth()]} {sel}</SLabel>
        <button style={ghostBtn} onClick={() => setShow(s => !s)}>{show ? "Cancel" : "+ Add event"}</button>
      </div>
      {show && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            <input style={inputSt} placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input style={inputSt} placeholder="Time (e.g. 3:00 PM)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <button style={primaryBtn} onClick={addEvt}>Add Event</button>
        </Card>
      )}
      {dayEvts.length === 0
        ? <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, padding: "24px 0" }}>No events — tap + to add one</div>
        : dayEvts.map(ev => (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFFFFF", border: "1px solid #E8ECF0", borderLeft: `3px solid ${ev.color}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>{ev.time}</div>
            </div>
            <button onClick={() => setEvents(es => es.filter(x => x.id !== ev.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        ))
      }
      {upcoming.length > 0 && <>
        <Divider />
        <SLabel>Upcoming</SLabel>
        {upcoming.slice(0, 5).map(ev => (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 40, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: ev.color, lineHeight: 1 }}>{ev.day}</div>
              <div style={{ fontSize: 8, color: "#9CA3AF", letterSpacing: 1 }}>MAY</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{ev.time}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
          </div>
        ))}
      </>}
    </div>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useLS("tk", DEF_TASKS);
  const [newT, setNewT] = useState("");
  const [pri, setPri] = useState("med");
  const [tag, setTag] = useState("Work");
  const [filter, setFilter] = useState("active");
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = id => setTasks(ts => ts.filter(t => t.id !== id));
  const add = () => { if (!newT.trim()) return; setTasks(ts => [...ts, { id: Date.now(), text: newT, done: false, priority: pri, tag }]); setNewT(""); };
  const PC = { high: "#E8445A", med: "#F59E0B", low: "#00B37A" };
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const filtered = tasks.filter(t => filter === "all" ? true : filter === "active" ? !t.done : t.done);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#222EFF", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Tasks</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>My Tasks</div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Ring pct={pct} size={88} stroke={7} color="#222EFF" bg="#E8ECF0" label="Complete">
            <div style={{ fontSize: 22, fontWeight: 800, color: "#222EFF" }}>{pct}%</div>
          </Ring>
          <div style={{ flex: 1 }}>
            {[
              { l: "High Priority", v: tasks.filter(t => !t.done && t.priority === "high").length, c: "#E8445A", bg: "#FDEEF1" },
              { l: "Medium", v: tasks.filter(t => !t.done && t.priority === "med").length, c: "#F59E0B", bg: "#FEF3C7" },
              { l: "Completed", v: done, c: "#00B37A", bg: "#E6F7F2" },
            ].map(p => (
              <div key={p.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{p.l}</div>
                <Pill label={p.v} color={p.c} bg={p.bg} />
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <input style={inputSt} placeholder="Add a new task..." value={newT} onChange={e => setNewT(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <select style={{ ...inputSt, flex: 1 }} value={pri} onChange={e => setPri(e.target.value)}>
            <option value="high">High priority</option>
            <option value="med">Medium</option>
            <option value="low">Low</option>
          </select>
          <input style={{ ...inputSt, flex: 1 }} placeholder="Tag" value={tag} onChange={e => setTag(e.target.value)} />
          <button style={{ ...primaryBtn, width: "auto", padding: "11px 20px" }} onClick={add}>+</button>
        </div>
      </Card>
      <TabBar2 tabs={["active", "done", "all"]} active={filter} onChange={setFilter} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", border: "1px solid #E8ECF0", borderRadius: 14, padding: "13px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", opacity: t.done ? 0.55 : 1, transition: "opacity .3s" }}>
            <div onClick={() => toggle(t.id)} style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${PC[t.priority]}`, background: t.done ? PC[t.priority] : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 900, transition: "all .2s" }}>{t.done ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: t.done ? "#9CA3AF" : "#111827", fontWeight: 500, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}><span style={{ color: PC[t.priority] }}>{t.priority}</span> · {t.tag}</div>
            </div>
            <button onClick={() => del(t.id)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV = [
  { label: "Home", icon: (a) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#222EFF" : "#9CA3AF"} strokeWidth={a ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>) },
  { label: "Health", icon: (a) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#222EFF" : "#9CA3AF"} strokeWidth={a ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>) },
  { label: "Finance", icon: (a) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#222EFF" : "#9CA3AF"} strokeWidth={a ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>) },
  { label: "Calendar", icon: (a) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#222EFF" : "#9CA3AF"} strokeWidth={a ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>) },
  { label: "Tasks", icon: (a) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#222EFF" : "#9CA3AF"} strokeWidth={a ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>) },
];

export default function App() {
  const [tab, setTab] = useState(0);
  const pages = [<Dashboard setTab={setTab} />, <HealthPage />, <FinancePage />, <CalendarPage />, <TasksPage />];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F8FA; color: #111827; font-family: 'DM Sans', sans-serif; min-height: 100vh; -webkit-font-smoothing: antialiased; }
        .shell { max-width: 430px; margin: 0 auto; padding: 0 0 90px; min-height: 100vh; }
        .topbar { position: sticky; top: 0; z-index: 50; background: rgba(247,248,250,0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid #E8ECF0; display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; }
        .wordmark { display: flex; align-items: center; gap: 10px; }
        .wordmark-name { font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.3px; }
        .wordmark-sub { font-size: 10px; color: #9CA3AF; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; margin-top: 1px; }
        .page-content { padding: 24px 18px; }
        .tab-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: rgba(255,255,255,0.94); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-top: 1px solid #E8ECF0; display: flex; padding: 10px 0 22px; z-index: 100; }
        .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; flex: 1; padding: 4px 0; }
        .nav-label { font-size: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; letter-spacing: 0.2px; transition: color .2s; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 99px; background: #E8ECF0; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input:focus, select:focus { border-color: #222EFF !important; }
        select option { background: white; }
        ::-webkit-scrollbar { width: 0; }
        * { -webkit-tap-highlight-color: transparent; }
        input, select, textarea { user-select: text; }
      `}</style>
      <div className="shell">
        <div className="topbar">
          <div className="wordmark">
            <Logo size={34} />
            <div>
              <div className="wordmark-name">Vitals</div>
              <div className="wordmark-sub">Life OS</div>
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0F2F5", border: "1px solid #E8ECF0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
        </div>
        <div className="page-content">{pages[tab]}</div>
      </div>
      <nav className="tab-bar">
        {NAV.map((n, i) => (
          <button key={n.label} className="nav-btn" onClick={() => setTab(i)}>
            {n.icon(tab === i)}
            <span className="nav-label" style={{ color: tab === i ? "#222EFF" : "#9CA3AF" }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
