import { Icon } from "../components/Icon";

export const Placeholder = ({ title, sub, module }: { title: string; sub: string; module: string }) => (
  <div className="page">
    <div className="breadcrumbs">
      <span>wekenx</span>
      <span className="here">{title}</span>
    </div>
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <div className="sub">{sub}</div>
      </div>
    </div>

    <div className="card" style={{ padding: 80, textAlign: "center" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>{title}</h3>
        <p className="muted" style={{ marginBottom: 24 }}>{module}</p>
        <p className="small subtle">This screen is a placeholder in the wireframe. The full implementation would include detailed management features, data tables, and interactive controls.</p>
      </div>
    </div>
  </div>
);
