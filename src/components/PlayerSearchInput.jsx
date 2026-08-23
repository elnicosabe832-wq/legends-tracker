import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function PlayerSearchInput({
  players,
  value,
  onChange,
  className = '',
}) {
  const { t } = useTranslation();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const sorted = useMemo(
    () => [...players].sort((a, b) => {
      const ga = a.history?.reduce((s, h) => s + h.goals, 0) ?? 0;
      const gb = b.history?.reduce((s, h) => s + h.goals, 0) ?? 0;
      return gb - ga;
    }),
    [players],
  );

  const selected = sorted.find((p) => p.name === value);

  useEffect(() => {
    if (!open) setQuery(selected?.name || '');
  }, [value, selected?.name, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) => p.name.toLowerCase().includes(q));
  }, [sorted, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(selected?.name || '');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, selected?.name]);

  const pick = (player) => {
    onChange(player.name);
    setQuery(player.name);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && filtered[highlight]) {
      e.preventDefault();
      pick(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery(selected?.name || '');
    }
  };

  return (
    <div className={`player-search-input${className ? ` ${className}` : ''}`} ref={wrapRef}>
      <input
        ref={inputRef}
        type="search"
        className="player-search-field"
        value={query}
        placeholder={t('muro.searchPlayerPlaceholder')}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
      />
      {open && filtered.length > 0 && (
        <ul className="player-search-dropdown" role="listbox">
          {filtered.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                role="option"
                aria-selected={p.name === value}
                className={`player-search-option${i === highlight ? ' highlighted' : ''}${p.name === value ? ' selected' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p)}
                onMouseEnter={() => setHighlight(i)}
              >
                <span className="player-search-name">{p.name}</span>
                <span className="player-search-meta">{p.pos}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <p className="player-search-empty">{t('muro.searchPlayerEmpty')}</p>
      )}
    </div>
  );
}
