import { useState } from "react";
import { Icon } from "../components/Icon";
import { ROUTES } from "../components/data";
import { StatusChip } from "../components/StatusChip";
import { VariationBar } from "../components/VariationBar";

export const ActiveRoutes = () => {
  const [variant, setVariant] = useState(0);

  return (
    <div className="page">
      <div className="breadcrumbs">
        <span>Daily Ops</span>
        <span className="here">Active Routes</span>
      </div>
      <div className="page-head">
        <div>
          <h1>
            Active routes{" "}
            <span className="chip" style={{ marginLeft: 8, verticalAlign: "middle" }}>
              <span className="dot" style={{ background: "var(--green)" }} />
              Live
            </span>
          </h1>
          <div className="sub">2 trucks on the road · auto-refreshing every 30s via native GPS geofencing</div>
        </div>
        <div className="actions">
          <button className="btn">
            <Icon name="refresh" size={14} /> Refresh
          </button>
          <button className="btn">
            <Icon name="bell" size={14} /> Alerts (1)
          </button>
          <button className="btn primary">
            <Icon name="download" size={14} /> End-of-day report
          </button>
        </div>
      </div>

      <VariationBar
        label="Tracking layout"
        note="A = single-truck deep dive (dispatcher focus). B = multi-truck overview (manager)."
        variants={["Map + stop timeline", "Multi-truck split view"]}
        current={variant}
        onChange={setVariant}
      />

      {variant === 0 ? <TrackingA /> : <TrackingB />}
    </div>
  );
};

const TrackingA = () => (
  <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 360px", gap: 16 }}>
    <div className="card" style={{ alignSelf: "start" }}>
      <div className="card-head">
        <h3>Today's routes</h3>
        <span className="chip">4</span>
      </div>
      <div>
        {ROUTES.map((r, i) => (
          <div
            key={r.id}
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              background: i === 0 ? "var(--blue-soft)" : undefined,
              borderLeft: i === 0 ? "3px solid var(--blue)" : "3px solid transparent",
            }}
          >
            <div className="between">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.id}</div>
              <StatusChip status={r.status} small />
            </div>
            <div className="small muted mt-1">
              {r.driver} · {r.truck}
            </div>
            <div className="row mt-1" style={{ gap: 6 }}>
              <div className="bar" style={{ flex: 1 }}>
                <div className="bar-fill green" style={{ width: `${(r.progress / r.stops) * 100}%` }} />
              </div>
              <span className="small mono">
                {r.progress}/{r.stops}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="card">
      <div className="card-head">
        <div>
          <h3>
            RT-101 · Luka M.{" "}
            <span className="chip green" style={{ padding: "1px 7px", fontSize: 11, marginLeft: 6 }}>
              <span className="dot" />
              On route
            </span>
          </h3>
          <div className="sub">Stop 3 of 4 · ETA to next: 14:30 · 18 min</div>
        </div>
      </div>
      <div className="map" style={{ height: 500 }}>
        <svg
          viewBox="0 0 400 500"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d="M 48 110 L 168 170 L 112 310"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeDasharray="3 3"
            fill="none"
          />
          <path d="M 112 310 L 192 380 L 176 270" stroke="var(--blue)" strokeWidth="2.5" fill="none" />
          <circle cx="176" cy="270" r="28" fill="rgba(59, 65, 112, 0.08)" stroke="var(--blue)" strokeDasharray="4 4" />
        </svg>
        <div className="map-pin green" style={{ top: "22%", left: "12%" }}>
          ✓
        </div>
        <div className="map-pin green" style={{ top: "34%", left: "42%" }}>
          ✓
        </div>
        <div className="map-pin truck" style={{ top: "54%", left: "44%" }}>
          T2
        </div>
        <div className="map-pin orange" style={{ top: "54%", left: "48%" }}>
          55
        </div>
        <div className="map-pin orange" style={{ top: "76%", left: "48%" }}>
          44
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "white",
            borderRadius: 8,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            minWidth: 170,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="small muted">Current location</div>
          <div style={{ fontWeight: 600 }}>Princes Hwy, Warrawong</div>
          <div className="small muted mt-1">
            Speed: <span className="mono">58 km/h</span>
          </div>
          <div className="small muted">
            Last ping: <span className="mono">12s ago</span>
          </div>
        </div>
      </div>
    </div>

    <div className="card" style={{ alignSelf: "start" }}>
      <div className="card-head">
        <div>
          <h3>Stop timeline</h3>
          <div className="sub">Auto-updated from driver app</div>
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {[
          {
            n: 1,
            name: "Coles Express — Miranda",
            state: "done",
            arr: "11:18",
            dep: "11:34",
            bags: "448 / 448",
            sig: true,
            note: null,
          },
          {
            n: 2,
            name: "BP Roadhouse — Pt Kembla",
            state: "done",
            arr: "12:41",
            dep: "13:09",
            bags: "620 / 624",
            sig: true,
            note: "4 bags wastage logged",
          },
          {
            n: 3,
            name: "Ampol — Warrawong",
            state: "current",
            arr: "—",
            dep: "—",
            bags: "pending",
            sig: false,
            note: null,
          },
          {
            n: 4,
            name: "Shell — Albion Park",
            state: "upcoming",
            arr: "—",
            dep: "—",
            bags: "—",
            sig: false,
            note: null,
          },
        ].map((s) => (
          <div
            key={s.n}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              background: s.state === "current" ? "var(--blue-soft)" : undefined,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: s.state === "done" ? "var(--green)" : s.state === "current" ? "var(--blue)" : "var(--bg-soft)",
                color: s.state === "upcoming" ? "var(--text-muted)" : "white",
                border: s.state === "upcoming" ? "1px dashed var(--border-strong)" : "none",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {s.state === "done" ? "✓" : s.n}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div className="small muted mt-1">
                <span>
                  <Icon name="pin" size={10} style={{ verticalAlign: "middle" }} /> Arrived {s.arr}
                </span>
                {s.dep !== "—" && <span> · Departed {s.dep}</span>}
              </div>
              <div className="small mt-1" style={{ display: "flex", gap: 8 }}>
                <span className="muted">
                  Bags: <span className="mono" style={{ color: "var(--text)" }}>{s.bags}</span>
                </span>
                {s.sig && (
                  <span className="chip green" style={{ padding: "0 6px", fontSize: 10 }}>
                    <Icon name="check" size={9} />
                    Signed
                  </span>
                )}
                {s.note && (
                  <span className="chip orange" style={{ padding: "0 6px", fontSize: 10 }}>
                    {s.note}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TrackingB = () => (
  <div>
    <div className="card mb-2">
      <div className="card-head">
        <div>
          <h3>Fleet view · 4 trucks</h3>
          <div className="sub">2 active · 1 planned · 1 completed</div>
        </div>
        <div className="row">
          <div className="legend">
            <span>
              <span className="sw" style={{ background: "var(--green)" }} />
              Delivered
            </span>
            <span>
              <span className="sw" style={{ background: "var(--blue)" }} />
              In progress
            </span>
            <span>
              <span className="sw" style={{ background: "var(--border-strong)" }} />
              Upcoming
            </span>
          </div>
        </div>
      </div>
      <div>
        {ROUTES.map((r, idx) => (
          <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="between mb-2">
              <div className="row" style={{ gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--bg-soft)",
                    display: "grid",
                    placeItems: "center",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon name="truck" size={18} />
                </div>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{r.id}</div>
                    <StatusChip status={r.status} small />
                  </div>
                  <div className="small muted mt-1">
                    {r.driver} · {r.truck} · {r.distance} · {r.duration}
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div className="small muted">Utilisation</div>
                  <div className="mono" style={{ fontWeight: 600 }}>
                    {r.utilisation}%
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small muted">Progress</div>
                  <div className="mono" style={{ fontWeight: 600 }}>
                    {r.progress}/{r.stops}
                  </div>
                </div>
                <button className="btn sm">Open</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {[...Array(r.stops)].map((_, i) => {
                const done = i < r.progress;
                const current = i === r.progress && r.status === "active";
                return (
                  <div key={i} style={{ display: "contents" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: done ? "var(--green)" : current ? "var(--blue)" : "white",
                        border: done || current ? "none" : "1.5px dashed var(--border-strong)",
                        color: done || current ? "white" : "var(--text-subtle)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: current ? "0 0 0 4px rgba(59, 65, 112, 0.18)" : "none",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    {i < r.stops - 1 && (
                      <div style={{ height: 2, flex: 1, background: done ? "var(--green)" : "var(--border)", minWidth: 20 }} />
                    )}
                  </div>
                );
              })}
              <div style={{ flex: 1, minWidth: 20 }} />
              {r.status === "active" && (
                <div className="chip blue" style={{ padding: "2px 8px" }}>
                  <Icon name="clock" size={10} />
                  Next ETA {idx === 0 ? "14:30" : "15:10"}
                </div>
              )}
              {r.status === "completed" && (
                <div className="chip green" style={{ padding: "2px 8px" }}>
                  <Icon name="check" size={10} />
                  Completed 15:42
                </div>
              )}
            </div>

            {r.status === "active" && (
              <div className="grid-3 mt-2" style={{ gap: 8 }}>
                <div className="card" style={{ border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="card-body" style={{ padding: 10 }}>
                    <div className="small muted">Current stop</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {idx === 0 ? "Ampol — Warrawong" : "IGA — Bulli"}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="card-body" style={{ padding: 10 }}>
                    <div className="small muted">Bags delivered</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }} className="mono">
                      {idx === 0 ? "1,068 / 1,476" : "218 / 618"}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="card-body" style={{ padding: 10 }}>
                    <div className="small muted">Alerts</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: idx === 0 ? "var(--orange)" : "var(--text)" }}>
                      {idx === 0 ? "1 wastage logged" : "None"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
