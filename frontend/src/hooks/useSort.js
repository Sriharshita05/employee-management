import { useCallback, useMemo, useState } from 'react';

/**
 * Generic click-to-sort state + comparator.
 *
 * comparators: { [key]: (item) => string | number } — a value extractor per sortable column.
 * Clicking the same key toggles asc -> desc -> unsorted. Clicking a new key starts at asc.
 */
export function useSort(comparators, initial = null) {
  const [sortState, setSortState] = useState(initial);

  const toggleSort = useCallback((key) => {
    setSortState((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }, []);

  const sortItems = useCallback(
    (items) => {
      if (!sortState || !comparators[sortState.key]) return items;
      const getValue = comparators[sortState.key];
      const sorted = [...items].sort((a, b) => {
        const valA = getValue(a);
        const valB = getValue(b);
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'string') {
          return valA.localeCompare(valB, undefined, { sensitivity: 'base' });
        }
        return valA - valB;
      });
      if (sortState.direction === 'desc') sorted.reverse();
      return sorted;
    },
    [sortState, comparators]
  );

  return { sortState, toggleSort, sortItems };
}

export function useSortedList(items, comparators, initial = null) {
  const { sortState, toggleSort, sortItems } = useSort(comparators, initial);
  const sorted = useMemo(() => sortItems(items), [items, sortItems]);
  return { sorted, sortState, toggleSort };
}
