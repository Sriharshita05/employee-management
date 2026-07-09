import { Icons } from './Icons';

/**
 * A <th> that toggles sort direction on click and shows an indicator icon.
 *
 * sortKey   - the field this header sorts by
 * sortState - { key, direction } | null  (direction is 'asc' | 'desc')
 * onSort    - (key) => void, called on click; caller owns the toggle logic
 */
function SortableTh({ sortKey, sortState, onSort, align, style, children }) {
  const isActive = sortState?.key === sortKey;
  const direction = isActive ? sortState.direction : null;

  return (
    <th
      className="th-sortable"
      style={{ textAlign: align || 'left', ...style }}
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className={isActive ? 'active' : ''}
        onClick={() => onSort(sortKey)}
        style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        {children}
        <span className="th-sort-icon">
          {direction === 'asc' && <Icons.SortAsc />}
          {direction === 'desc' && <Icons.SortDesc />}
          {!isActive && <Icons.SortNeutral />}
        </span>
      </button>
    </th>
  );
}

export default SortableTh;
