import { useState, useRef, useEffect, useCallback } from "react";

/**
 * useSelectPagination — shared pagination+search logic for Select dropdowns.
 *
 * @param {Function} fetchFn  – async ({ page, limit, search }) => { data, total }
 * @param {number}   [limit=10]
 */
export default function useSelectPagination(fetchFn, limit = 10) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const mountedRef = useRef(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(
    (pageNum = 1, searchText = "") => {
      fetchFn({ page: pageNum, limit, search: searchText })
        .then((res) => {
          if (!mountedRef.current) return;
          if (pageNum === 1) {
            setItems(res.data);
          } else {
            setItems((prev) => [...prev, ...res.data]);
          }
          setPage(pageNum);
          setHasMore(res.data.length === limit && res.total > pageNum * limit);
        })
        .catch(() => {});
    },
    [fetchFn, limit]
  );

  const reset = useCallback(() => {
    setSearch("");
    setPage(1);
    setHasMore(false);
    load(1, "");
  }, [load]);

  const handleSearch = useCallback(
    (text) => {
      setSearch(text);
      setPage(1);
      load(1, text);
    },
    [load]
  );

  const handleLoadMore = useCallback(() => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetchFn({ page: nextPage, limit, search })
      .then((res) => {
        setItems((prev) => [...prev, ...res.data]);
        setPage(nextPage);
        setHasMore(res.data.length === limit && res.total > nextPage * limit);
      })
      .catch(() => {})
      .finally(() => {
        loadingMoreRef.current = false;
        if (mountedRef.current) setLoadingMore(false);
      });
  }, [fetchFn, limit, page, search]);

  return {
    items,
    hasMore,
    loadingMore,
    reset,
    handleSearch,
    handleLoadMore,
  };
}
