"use client";

import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export function useClientPagination<T>(items: T[], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const updatePageSize = (nextPageSize: number) => {
    setPage(1);
    setPageSize(nextPageSize);
  };

  return {
    page: safePage,
    pageSize,
    paginatedItems,
    setPage,
    setPageSize: updatePageSize,
    total,
    totalPages,
  };
}
