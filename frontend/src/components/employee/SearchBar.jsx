import { Icons } from '../common/Icons';

function SearchBar({ value, onChange }) {
  return (
    <div className="navbar-search">
      <Icons.Search />
      <input
        type="text"
        className="navbar-search-input"
        placeholder="Search by name, ID, email, or department…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <span
          className="navbar-search-clear"
          onClick={() => onChange('')}
          title="Clear search"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onChange('')}
        >
          <Icons.X />
        </span>
      ) : (
        <span className="navbar-search-shortcut">⌘K</span>
      )}
    </div>
  );
}

export default SearchBar;
