import { useEffect, useRef, useState } from 'react';
import { Icons } from './Icons';
import Button from './Button';

const FORMATS = [
  { key: 'excel', label: 'Excel', hint: '.xls spreadsheet' },
  { key: 'pdf', label: 'PDF', hint: '.pdf document' },
  { key: 'csv', label: 'CSV', hint: '.csv file' },
];

/**
 * A small "Export" button that opens a dropdown with Excel / PDF / CSV
 * options. Call the relevant `onExport*` handler is left to the parent —
 * this component only handles the open/close UI behaviour.
 */
function ExportMenu({ onExportExcel, onExportPDF, onExportCSV, disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handlers = {
    excel: onExportExcel,
    pdf: onExportPDF,
    csv: onExportCSV,
  };

  const handleSelect = (key) => {
    setOpen(false);
    handlers[key]?.();
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Icons.Download /> Export
        <span
          style={{
            display: 'inline-flex',
            marginLeft: '2px',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        >
          <Icons.ChevronDown />
        </span>
      </Button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: '190px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(17, 17, 17, 0.14)',
            padding: '6px',
            zIndex: 60,
          }}
        >
          {FORMATS.map((format) => (
            <button
              key={format.key}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(format.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                borderRadius: '7px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--color-text)',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(170, 28, 65, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: 'rgba(170, 28, 65, 0.1)',
                  color: 'var(--color-accent)',
                }}
              >
                <Icons.FileText />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{format.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{format.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
