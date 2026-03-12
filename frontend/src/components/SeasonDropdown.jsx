import { useEffect, useRef, useState } from "react";

export default function SeasonDropdown({
  value,
  options = [],
  onChange,
  label = "SEASON",
  width = 170,
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

  return (
    <div
      ref={rootRef}
      className="filters-group"
      style={{
        position: "relative",
        minWidth: width,
        zIndex: 60,
      }}
    >
      <span className="filters-label">{label}</span>

      <button
        type="button"
        className="seasonDropdownTrigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{value}</span>
        <span
          style={{
            fontSize: 11,
            opacity: 0.9,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .18s ease",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="seasonDropdownMenu" role="listbox">
          {options.map((year) => {
            const selected = Number(value) === Number(year);

            return (
              <button
                key={year}
                type="button"
                className={`seasonDropdownOption ${selected ? "selected" : ""}`}
                onClick={() => {
                  onChange(Number(year));
                  setOpen(false);
                }}
                role="option"
                aria-selected={selected}
              >
                <span>{year}</span>
                {selected ? <span style={{ opacity: 0.85 }}>✓</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}