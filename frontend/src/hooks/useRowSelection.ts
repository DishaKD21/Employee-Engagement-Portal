"use client";

import { useMemo, useState } from "react";

export function useRowSelection<T extends string | number>(visibleIds: T[], allIds: T[] = visibleIds) {
  const [selectedIds, setSelectedIds] = useState<T[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleSelectedCount = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  const toggleOne = (id: T) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const visibleSet = new Set(visibleIds);

      if (visibleIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleSet.has(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const clearSelection = () => setSelectedIds([]);
  const pruneSelection = () => setSelectedIds((current) => current.filter((id) => allIds.includes(id)));

  return {
    allVisibleSelected,
    clearSelection,
    pruneSelection,
    selectedIds,
    selectedSet,
    selectedCount: selectedIds.length,
    someVisibleSelected,
    toggleOne,
    toggleVisible,
  };
}
