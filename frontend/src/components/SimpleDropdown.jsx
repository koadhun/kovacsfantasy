import { useEffect, useRef, useState } from "react";

export default function SimpleDropdown({
  value,
  options = [], // [{ value, label }]
  onChange,
  label = "",
  width = 160,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const current = options.find((o) => o.value === value);
  const currentLabel = current ? current.label : "Select";

  return (
    <div
      ref={rootRef}
      className="filters-group"
      style={{ position: "relative", minWidth: width, zIndex: 60 }}
    >
      {label && <span className="filters-label">{label}</span>}

      <button
        type="button"
        className="weekDropdownTrigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{currentLabel}</span>
        <span
          style={{
            fontSize: 12,
            opacity: 0.9,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .18s ease",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="weekDropdownMenu" role="listbox">
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                className={`weekDropdownOption ${selected ? "selected" : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                role="option"
                aria-selected={selected}
              >
                <span>{o.label}</span>
                {selected ? <span style={{ opacity: 0.85 }}>✓</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}