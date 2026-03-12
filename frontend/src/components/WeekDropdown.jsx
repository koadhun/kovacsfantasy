import { useEffect, useRef, useState } from "react";

export default function WeekDropdown({
  value,
  options = [],
  onChange,
  label = "WEEK",
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

  const currentLabel = value ? `Week ${value}` : "Select week";

  return (
    <div
      ref={rootRef}
      className="filters-group"
      style={{
        position: "relative",
        minWidth: width,
      }}
    >
      <span className="filters-label">{label}</span>

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
          {options.map((w) => {
            const selected = Number(value) === Number(w);

            return (
              <button
                key={w}
                type="button"
                className={`weekDropdownOption ${selected ? "selected" : ""}`}
                onClick={() => {
                  onChange(Number(w));
                  setOpen(false);
                }}
                role="option"
                aria-selected={selected}
              >
                <span>Week {w}</span>
                {selected ? <span style={{ opacity: 0.85 }}>✓</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}