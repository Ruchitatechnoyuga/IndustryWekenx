// Status chip component
export const StatusChip = ({ status, small }: { status: string; small?: boolean }) => {
  const map: Record<string, { label: string; cls: string }> = {
    red: { label: "Urgent", cls: "red" },
    orange: { label: "Order soon", cls: "orange" },
    green: { label: "OK", cls: "green" },
    hold: { label: "On hold", cls: "hold" },
    active: { label: "Active", cls: "blue" },
    planned: { label: "Planned", cls: "grey" },
    completed: { label: "Completed", cls: "green" }
  };

  const m = map[status] || { label: status, cls: "grey" };

  return (
    <span className={`chip ${m.cls}`} style={small ? { padding: "1px 7px", fontSize: 11 } : undefined}>
      <span className="dot" /> {m.label}
    </span>
  );
};
