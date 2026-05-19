export const VariationBar = ({
  label,
  variants,
  current,
  onChange,
  note
}: {
  label: string;
  variants: string[];
  current: number;
  onChange: (index: number) => void;
  note?: string;
}) => (
  <div className="variation-bar">
    <strong>{label}</strong>
    {note && <span>— {note}</span>}
    <div className="variants">
      {variants.map((v, i) => (
        <button
          key={i}
          className={`vbtn ${current === i ? "active" : ""}`}
          onClick={() => onChange(i)}
        >
          Option {String.fromCharCode(65 + i)} · {v}
        </button>
      ))}
    </div>
  </div>
);
