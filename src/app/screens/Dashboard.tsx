import { useState } from "react";
import { Icon } from "../components/Icon";
import { SITES, ROUTES } from "../components/data";
import { StatusChip } from "../components/StatusChip";
import { VariationBar } from "../components/VariationBar";

export const Dashboard = () => {
  const [variant, setVariant] = useState(0);

  return (
    <div className="page">
      <div className="breadcrumbs">
        <span>Home</span>
        <span className="here">Operations overview</span>
      </div>
      <div className="page-head">
        <div>
          <h1>Good morning, Nicole</h1>
          <div className="sub">Tuesday, 20 April 2026 — 8 sites need attention today, 2 routes active.</div>
        </div>
        <div className="actions">
          <button className="btn">
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn primary">
            <Icon name="sparkles" size={14} /> Plan today's routes
          </button>
        </div>
      </div>

      <VariationBar
        label="Dashboard layout"
        note="Two ways to surface the same data. Pick the one that fits how Ops scans the morning."
        variants={["KPIs + map + queue", "Site-card grid by urgency"]}
        current={variant}
        onChange={setVariant}
      />

      {variant === 0 ? <DashboardA /> : <DashboardB />}
    </div>
  );
};

const DashboardA = () => (
  <div>
    <div className="kpi-row">
      <div className="kpi">
        <div className="label">
          <Icon name="alert" size={12} /> Urgent sites
        </div>
        <div className="value" style={{ color: "var(--red)" }}>3</div>
        <div className="delta">2 need dispatch in &lt; 2h</div>
      </div>
      <div className="kpi">
        <div className="label">
          <Icon name="clock" size={12} /> Order-soon
        </div>
        <div className="value" style={{ color: "var(--orange)" }}>5</div>
        <div className="delta">Rollover to tomorrow if skipped</div>
      </div>
      <div className="kpi">
        <div className="label">
          <Icon name="truck" size={12} /> Active routes
        </div>
        <div className="value">
          2<span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}> / 4 planned</span>
        </div>
        <div className="delta up">On schedule</div>
      </div>
      <div className="kpi">
        <div className="label">
          <Icon name="box" size={12} /> Bags delivered today
        </div>
        <div className="value">1,248</div>
        <div className="delta up">+12% vs yesterday</div>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Live operations map</h3>
            <div className="sub">All sites · 2 trucks on road</div>
          </div>
          <div className="row">
            <div className="legend">
              <span><span className="sw" style={{ background: "var(--red)" }} />Urgent</span>
              <span><span className="sw" style={{ background: "var(--orange)" }} />Soon</span>
              <span><span className="sw" style={{ background: "var(--green)" }} />OK</span>
              <span><span className="sw" style={{ background: "var(--blue)" }} />Truck</span>
            </div>
            <div className="segmented">
              <button className="seg active">Today</button>
              <button className="seg">Week</button>
            </div>
          </div>
        </div>
        <div className="map" style={{ height: 380 }}>
          <svg className="map-route" viewBox="0 0 400 380" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <path d="M 60 100 Q 140 180 168 130 T 272 205" />
            <path d="M 112 235 Q 180 270 232 205 T 304 220" />
          </svg>
          {SITES.map(s => (
            <div key={s.id} className={`map-pin ${s.status}`} style={{ top: `${s.top}%`, left: `${s.left}%` }}>{s.id.slice(-2)}</div>
          ))}
          <div className="map-pin truck" style={{ top: "46%", left: "36%" }}>T2</div>
          <div className="map-pin truck" style={{ top: "66%", left: "52%" }}>T5</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Sites needing attention</h3>
            <div className="sub">Ordered by urgency, then by last delivery</div>
          </div>
          <button className="btn sm">View all</button>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {SITES.filter(s => s.status !== "green" && s.status !== "hold").map(s => (
            <div key={s.id} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer" }}>
              <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: `var(--${s.status === "red" ? "red" : "orange"})` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div className="small muted">{s.id} · Last delivered {s.lastDelivered.toLowerCase()} · needs {s.required} bags</div>
              </div>
              <div className="col" style={{ alignItems: "flex-end", gap: 2 }}>
                <StatusChip status={s.status} small />
                {s.emergency && <span className="chip red" style={{ padding: "1px 7px", fontSize: 11 }}><Icon name="alert" size={10} />Emergency</span>}
              </div>
              <button className="btn sm">Assign</button>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-head">
        <div>
          <h3>Today's routes</h3>
          <div className="sub">4 routes planned · 2 in progress</div>
        </div>
        <div className="row">
          <button className="btn sm"><Icon name="filter" size={12} /> Filter</button>
          <button className="btn primary sm"><Icon name="plus" size={12} /> New route</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th style={{ width: 36 }}><div className="cbox" /></th>
              <th>Route</th><th>Driver</th><th>Truck</th><th>Stops</th><th>Distance</th><th>Duration</th><th>Truck utilisation</th><th>Progress</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ROUTES.map(r => (
              <tr key={r.id}>
                <td><div className="cbox" /></td>
                <td style={{ fontWeight: 500 }}>{r.id}</td>
                <td>{r.driver}</td>
                <td className="mono">{r.truck}</td>
                <td className="num">{r.stops}</td>
                <td className="num muted">{r.distance}</td>
                <td className="num muted">{r.duration}</td>
                <td style={{ minWidth: 140 }}>
                  <div className="row">
                    <div className="bar" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${r.utilisation}%` }} /></div>
                    <span className="small mono">{r.utilisation}%</span>
                  </div>
                </td>
                <td style={{ minWidth: 110 }}>
                  <div className="small mono">{r.progress}/{r.stops}</div>
                  <div className="bar" style={{ marginTop: 3 }}><div className="bar-fill green" style={{ width: `${(r.progress / r.stops) * 100}%` }} /></div>
                </td>
                <td><StatusChip status={r.status} small /></td>
                <td><button className="btn ghost sm"><Icon name="dots" size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DashboardB = () => {
  const buckets = {
    red: SITES.filter(s => s.status === "red"),
    orange: SITES.filter(s => s.status === "orange"),
    green: SITES.filter(s => s.status === "green"),
    hold: SITES.filter(s => s.status === "hold"),
  };

  return (
    <div>
      <div className="card mb-2">
        <div className="card-head">
          <div>
            <h3>Today · All sites by urgency</h3>
            <div className="sub">Click a card to open site detail · bulk select to assign</div>
          </div>
          <div className="row">
            <div className="segmented">
              <button className="seg active"><Icon name="grid" size={12} /> Cards</button>
              <button className="seg"><Icon name="list" size={12} /> List</button>
              <button className="seg"><Icon name="map" size={12} /> Map</button>
            </div>
            <button className="btn sm"><Icon name="filter" size={12} /> Filter</button>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          {[
            { k: "red" as const, title: "Urgent — dispatch today", note: "Red status or emergency request" },
            { k: "orange" as const, title: "Order soon", note: "Deliver on next run to avoid rollover" },
            { k: "green" as const, title: "Stocked — no action needed", note: "Visible for reference only" },
            { k: "hold" as const, title: "On hold", note: "Excluded from route planning" },
          ].map(b => (
            <div key={b.k} style={{ marginBottom: 20 }}>
              <div className="between mb-1">
                <div className="row">
                  <span className={`chip ${b.k === "hold" ? "hold" : b.k}`}><span className="dot" />{b.title}</span>
                  <span className="small muted">{buckets[b.k].length} sites</span>
                </div>
                <span className="small subtle">{b.note}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {buckets[b.k].map(s => (
                  <div key={s.id} className={`site-card ${s.status}`}>
                    <div className="between">
                      <span className="mono subtle" style={{ fontSize: 11 }}>{s.id}</span>
                      <div className="row" style={{ gap: 4 }}>
                        {s.emergency && <span className="chip red" style={{ padding: "0 5px", fontSize: 10 }}>!</span>}
                        {s.hasPO && <span className="chip" style={{ padding: "0 5px", fontSize: 10 }}>PO</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.25 }}>{s.name}</div>
                    <div className="small muted">{s.suburb}</div>
                    <div className="divider" style={{ margin: "6px 0" }} />
                    <div className="between small">
                      <span className="muted">Capacity</span>
                      <span className="mono">{s.current}/{s.capacity}</span>
                    </div>
                    <div className="bar"><div className={`bar-fill ${s.status}`} style={{ width: `${(s.current / s.capacity) * 100}%` }} /></div>
                    <div className="between small muted mt-1">
                      <span>Need: <b style={{ color: "var(--text)" }}>{s.required || "—"}</b></span>
                      <span>{s.scheduled}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
