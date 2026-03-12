import { useState, useEffect } from "react";

const STRESS_SOURCES = ["Work / Deadlines", "Health / Body", "General Anxiety"];
const TIMES_OF_DAY = ["Morning", "Afternoon", "Evening", "Night"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STRESS_COLORS = {
  1: "#4ade80", 2: "#86efac", 3: "#fbbf24", 4: "#fb923c", 5: "#ef4444",
};
const STRESS_LABELS = { 1: "Calm", 2: "Mild", 3: "Moderate", 4: "High", 5: "Intense" };

const COPING_TIPS = {
  "Work / Deadlines": [
    "Break tasks into 25-min sprints",
    "Write tomorrow's top 3 tasks tonight",
    "Say no to one non-essential thing today",
  ],
  "Health / Body": [
    "5-min body scan meditation",
    "10 deep belly breaths",
    "Step outside for 5 minutes",
  ],
  "General Anxiety": [
    "Name 5 things you can see right now",
    "Write your worry down, then close the notebook",
    "Box breathing: 4 in, 4 hold, 4 out, 4 hold",
  ],
};

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("stressEntries") || "[]");
    } catch {
      return [];
    }
  });
  const [view, setView] = useState("log");
  const [form, setForm] = useState({
    date: getToday(),
    time: TIMES_OF_DAY[Math.floor(new Date().getHours() / 6)],
    level: 3,
    sources: [],
    note: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("stressEntries", JSON.stringify(entries));
    } catch {}
  }, [entries]);

  function handleSubmit() {
    if (form.sources.length === 0) return;
    const entry = { ...form, id: Date.now() };
    setEntries((prev) => [entry, ...prev]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm((f) => ({ ...f, level: 3, sources: [], note: "" }));
  }

  function toggleSource(s) {
    setForm((f) => ({
      ...f,
      sources: f.sources.includes(s)
        ? f.sources.filter((x) => x !== s)
        : [...f.sources, s],
    }));
  }

  const last7 = entries.filter((e) => {
    const diff = (new Date(getToday()) - new Date(e.date)) / 86400000;
    return diff >= 0 && diff < 7;
  });

  const avgLevel = last7.length
    ? (last7.reduce((a, b) => a + b.level, 0) / last7.length).toFixed(1)
    : null;

  const sourceFreq = STRESS_SOURCES.reduce((acc, s) => {
    acc[s] = last7.filter((e) => e.sources.includes(s)).length;
    return acc;
  }, {});

  const timeFreq = TIMES_OF_DAY.reduce((acc, t) => {
    const relevant = last7.filter((e) => e.time === t);
    acc[t] = relevant.length
      ? (relevant.reduce((a, b) => a + b.level, 0) / relevant.length).toFixed(1)
      : null;
    return acc;
  }, {});

  const peakTime = Object.entries(timeFreq)
    .filter(([, v]) => v !== null)
    .sort(([, a], [, b]) => b - a)[0];

  const topSource = Object.entries(sourceFreq).sort(([, a], [, b]) => b - a)[0];

  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dailyAvg = last7Dates.map((date) => {
    const dayEntries = entries.filter((e) => e.date === date);
    return dayEntries.length
      ? dayEntries.reduce((a, b) => a + b.level, 0) / dayEntries.length
      : null;
  });

  const s = styles;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <span style={s.logoText}>pulse</span>
            <span style={s.logoSub}>stress tracker</span>
          </div>
          <div style={s.navRow}>
            {["log", "patterns", "insights"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  ...s.navBtn,
                  background: view === v ? "#c9a96e" : "transparent",
                  color: view === v ? "#0f0f14" : "#888",
                  border: `1px solid ${view === v ? "#c9a96e" : "#333"}`,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.content}>
        {/* ── LOG ── */}
        {view === "log" && (
          <div>
            <div style={s.card}>
              <div style={s.sectionLabel}>How are you feeling?</div>

              {/* Date + Time */}
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.fieldLabel}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    style={s.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.fieldLabel}>Time of Day</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    style={s.input}
                  >
                    {TIMES_OF_DAY.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stress Level */}
              <div style={{ marginBottom: 18 }}>
                <label style={s.fieldLabel}>
                  Stress Level —{" "}
                  <span style={{ color: STRESS_COLORS[form.level] }}>
                    {STRESS_LABELS[form.level]}
                  </span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm((f) => ({ ...f, level: n }))}
                      style={{
                        flex: 1, height: 44, borderRadius: 10,
                        background: form.level === n ? STRESS_COLORS[n] : "#0f0f14",
                        border: `2px solid ${form.level >= n ? STRESS_COLORS[n] : "#2a2a3e"}`,
                        color: form.level === n ? "#0f0f14" : STRESS_COLORS[n],
                        fontSize: 16, fontWeight: "bold", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div style={{ marginBottom: 18 }}>
                <label style={s.fieldLabel}>Source(s)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {STRESS_SOURCES.map((src) => (
                    <button
                      key={src}
                      onClick={() => toggleSource(src)}
                      style={{
                        background: form.sources.includes(src) ? "#1e2a1e" : "#0f0f14",
                        border: `1px solid ${form.sources.includes(src) ? "#4ade80" : "#2a2a3e"}`,
                        borderRadius: 10, padding: "10px 14px",
                        color: form.sources.includes(src) ? "#4ade80" : "#888",
                        fontSize: 13, cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {form.sources.includes(src) ? "✓" : "○"}
                      </span>
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 20 }}>
                <label style={s.fieldLabel}>Note (optional)</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="What's on your mind?"
                  rows={2}
                  style={{ ...s.input, resize: "none", fontFamily: "Georgia, serif" }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={form.sources.length === 0}
                style={{
                  width: "100%", padding: "13px", borderRadius: 12,
                  background: form.sources.length > 0 ? "#c9a96e" : "#2a2a3e",
                  color: form.sources.length > 0 ? "#0f0f14" : "#555",
                  border: "none", fontSize: 13, letterSpacing: "2px",
                  textTransform: "uppercase", fontFamily: "monospace",
                  cursor: form.sources.length > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.2s", fontWeight: "bold",
                }}
              >
                {saved ? "✓ Saved" : "Log Entry"}
              </button>
            </div>

            {entries.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#666", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>
                  Recent Entries
                </div>
                {entries.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    style={{
                      background: "#16161e", border: "1px solid #2a2a3e",
                      borderRadius: 12, padding: "14px 16px", marginBottom: 10,
                      borderLeft: `3px solid ${STRESS_COLORS[e.level]}`,
                      display: "flex", alignItems: "flex-start", gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: STRESS_COLORS[e.level] + "22",
                        border: `1px solid ${STRESS_COLORS[e.level]}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: "bold", color: STRESS_COLORS[e.level], flexShrink: 0,
                      }}
                    >
                      {e.level}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#aaa", fontFamily: "monospace" }}>
                          {formatDate(e.date)} · {e.time}
                        </span>
                        <span style={{ fontSize: 11, color: STRESS_COLORS[e.level], fontFamily: "monospace" }}>
                          {STRESS_LABELS[e.level]}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: e.note ? 4 : 0 }}>
                        {e.sources.join(", ")}
                      </div>
                      {e.note && (
                        <div style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>
                          "{e.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATTERNS ── */}
        {view === "patterns" && (
          <div>
            {last7.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "1px" }}>
                  Log a few entries to see patterns
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <div style={s.card}>
                    <div style={s.fieldLabel}>7-day avg</div>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: avgLevel ? STRESS_COLORS[Math.round(avgLevel)] : "#888" }}>
                      {avgLevel || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>
                      {avgLevel ? STRESS_LABELS[Math.round(avgLevel)] : ""}
                    </div>
                  </div>
                  <div style={s.card}>
                    <div style={s.fieldLabel}>Entries</div>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: "#c9a96e" }}>{last7.length}</div>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>this week</div>
                  </div>
                </div>

                <div style={{ ...s.card, marginBottom: 16 }}>
                  <div style={s.sectionLabel}>Daily Stress — Last 7 Days</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
                    {last7Dates.map((date, i) => {
                      const val = dailyAvg[i];
                      const height = val ? (val / 5) * 80 : 4;
                      const color = val ? STRESS_COLORS[Math.round(val)] : "#2a2a3e";
                      const d = new Date(date + "T00:00:00");
                      return (
                        <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 9, color: val ? color : "#444", fontFamily: "monospace" }}>{val ? Number(val).toFixed(1) : ""}</div>
                          <div style={{ width: "100%", height, background: color, borderRadius: "4px 4px 2px 2px", opacity: val ? 1 : 0.3 }} />
                          <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>{DAYS[d.getDay()]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ ...s.card, marginBottom: 16 }}>
                  <div style={s.sectionLabel}>Stress Sources</div>
                  {STRESS_SOURCES.map((src) => (
                    <div key={src} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#aaa" }}>{src}</span>
                        <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>{sourceFreq[src]}x</span>
                      </div>
                      <div style={{ height: 6, background: "#0f0f14", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 4, background: "#c9a96e",
                          width: last7.length ? `${(sourceFreq[src] / last7.length) * 100}%` : "0%",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={s.card}>
                  <div style={s.sectionLabel}>Avg Stress by Time of Day</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {TIMES_OF_DAY.map((t) => (
                      <div key={t} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          height: timeFreq[t] ? `${(timeFreq[t] / 5) * 60}px` : "8px",
                          background: timeFreq[t] ? STRESS_COLORS[Math.round(timeFreq[t])] : "#2a2a3e",
                          borderRadius: 6, marginBottom: 6, opacity: timeFreq[t] ? 1 : 0.4,
                        }} />
                        <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>{t.slice(0, 3)}</div>
                        {timeFreq[t] && <div style={{ fontSize: 10, color: STRESS_COLORS[Math.round(timeFreq[t])], fontFamily: "monospace" }}>{timeFreq[t]}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {view === "insights" && (
          <div>
            {last7.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "1px" }}>
                  Log a few entries to get insights
                </div>
              </div>
            ) : (
              <>
                <div style={{ ...s.card, background: "#1a1a0e", border: "1px solid #c9a96e33", marginBottom: 16 }}>
                  <div style={s.sectionLabel}>Pattern Detected</div>
                  {peakTime && (
                    <p style={{ fontSize: 14, color: "#ddd", lineHeight: 1.6, margin: "0 0 8px" }}>
                      Your stress tends to peak in the{" "}
                      <strong style={{ color: "#c9a96e" }}>{peakTime[0]}</strong>{" "}
                      (avg {peakTime[1]}/5).
                    </p>
                  )}
                  {topSource && topSource[1] > 0 && (
                    <p style={{ fontSize: 14, color: "#ddd", lineHeight: 1.6, margin: 0 }}>
                      <strong style={{ color: "#c9a96e" }}>{topSource[0]}</strong> has been your most frequent stressor this week.
                    </p>
                  )}
                </div>

                {STRESS_SOURCES.filter((s) => sourceFreq[s] > 0).map((src) => (
                  <div key={src} style={{ ...s.card, marginBottom: 14 }}>
                    <div style={{ ...s.sectionLabel, color: "#4ade80" }}>Tips for {src}</div>
                    {COPING_TIPS[src].map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#4ade80", fontSize: 14, marginTop: 1, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div style={s.card}>
                  <div style={s.fieldLabel}>Remember</div>
                  <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                    Tracking stress is the first step to changing it. Patterns only become clear over days and weeks — keep logging, even when things feel fine.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f14",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#e8e0d4",
  },
  header: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f14 100%)",
    borderBottom: "1px solid #2a2a3e",
    padding: "28px 24px 20px",
    position: "sticky", top: 0, zIndex: 10,
  },
  headerInner: { maxWidth: 520, margin: "0 auto" },
  logoRow: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 },
  logoText: { fontSize: 22, fontStyle: "italic", color: "#c9a96e", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 11, color: "#666", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "monospace" },
  navRow: { display: "flex", gap: 6, marginTop: 14 },
  navBtn: {
    borderRadius: 20, padding: "5px 16px", fontSize: 12,
    letterSpacing: "1px", textTransform: "uppercase",
    cursor: "pointer", fontFamily: "monospace", transition: "all 0.2s",
  },
  content: { maxWidth: 520, margin: "0 auto", padding: "24px 16px 80px" },
  card: {
    background: "#16161e", border: "1px solid #2a2a3e",
    borderRadius: 16, padding: "22px 20px", marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11, color: "#c9a96e", letterSpacing: "2px",
    textTransform: "uppercase", fontFamily: "monospace", marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 10, color: "#666", letterSpacing: "1px",
    textTransform: "uppercase", fontFamily: "monospace",
    display: "block", marginBottom: 6,
  },
  input: {
    background: "#0f0f14", border: "1px solid #333", borderRadius: 8,
    color: "#e8e0d4", padding: "8px 12px", fontSize: 13, width: "100%",
    outline: "none", fontFamily: "monospace", boxSizing: "border-box",
  },
  empty: { textAlign: "center", padding: "60px 20px", color: "#555" },
};
