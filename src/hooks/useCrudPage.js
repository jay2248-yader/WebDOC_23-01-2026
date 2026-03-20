import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/**
 * useCrudPage — shared logic for every CRUD listing page.
 *
 * Supports TWO modes automatically:
 *   • Server-side pagination: fetchAll returns { data, total, lastPage }
 *   • Client-side pagination:  fetchAll returns a plain array
 *
 * @param {Object}   opts
 * @param {Function} opts.fetchAll    – async (params) => data[] | { data, total, lastPage }
 * @param {Function} opts.createItem  – async (payload) => void
 * @param {Function} opts.updateItem  – async (payload) => void
 * @param {Function} opts.deleteItem  – async (id) => void
 * @param {string}   opts.idKey       – primary key field name (e.g. "ids", "gid")
 * @param {Function} [opts.filterFn]  – (item, lowerSearch) => boolean  (client-side only)
 */
export default function useCrudPage({
  fetchAll,
  createItem,
  updateItem,
  deleteItem,
  idKey,
  filterFn,
}) {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [items, setItems] = useState([]);
  const [serverMeta, setServerMeta] = useState(null); // { total, lastPage } or null
  const [loadingData, setLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const tableRef = useRef(null);
  const modalTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(modalTimerRef.current);
    };
  }, []);

  const applyResult = useCallback((result) => {
    if (Array.isArray(result)) {
      setItems(result);
      setServerMeta(null);
    } else {
      setItems(Array.isArray(result.data) ? result.data : []);
      setServerMeta({ total: result.total || 0, lastPage: result.lastPage || 1 });
    }
  }, []);

  const refreshData = useCallback(async (signal) => {
    try {
      setLoadingData(true);
      const result = await fetchAll({ page, limit: pageSize, search: searchText }, signal);
      if (!mountedRef.current) return;
      applyResult(result);
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
      console.error("Failed to fetch data:", error);
    } finally {
      if (mountedRef.current) setLoadingData(false);
    }
  }, [fetchAll, page, pageSize, searchText, applyResult]);

  useEffect(() => {
    const controller = new AbortController();
    refreshData(controller.signal);
    return () => controller.abort();
  }, [refreshData]);

  // Client-side filtering (only when NOT server-paginated)
  const filtered = useMemo(() => {
    if (serverMeta) return items;
    if (!searchText || !filterFn) return items;
    const lower = searchText.toLowerCase();
    return items.filter((item) => filterFn(item, lower));
  }, [searchText, items, filterFn, serverMeta]);

  const totalPages = serverMeta
    ? serverMeta.lastPage
    : Math.ceil(filtered.length / pageSize) || 1;

  const totalItems = serverMeta
    ? serverMeta.total
    : filtered.length;

  const safePage = Math.min(Math.max(page, 1), totalPages);

  // Client-side slicing (only when NOT server-paginated)
  const pageItems = useMemo(() => {
    if (serverMeta) return items;
    return filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filtered, items, safePage, pageSize, serverMeta]);

  const handleSearchChange = useCallback((v) => {
    setSearchText(v);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage) => setPage(Math.min(Math.max(nextPage, 1), totalPages)),
    [totalPages]
  );

  const handleCreate = useCallback(() => {
    setIsLoading(true);
    setEditingItem(null);
    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  }, []);

  const handleEdit = useCallback((item) => {
    setIsLoading(true);
    setEditingItem(item);
    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowFormModal(false);
    setEditingItem(null);
  }, []);

  const handleSubmit = useCallback(
    async (formData) => {
      try {
        if (editingItem) {
          await updateItem({ [idKey]: editingItem[idKey], ...formData });
        } else {
          await createItem(formData);
        }
        await refreshData();
      } catch (error) {
        console.error("Failed to submit:", error);
        throw error;
      }
    },
    [editingItem, updateItem, createItem, refreshData, idKey]
  );

  const handleDelete = useCallback(
    async (item) => {
      try {
        await deleteItem(item[idKey]);
        await refreshData();
      } catch (error) {
        console.error("Failed to delete:", error);
        throw error;
      }
    },
    [deleteItem, refreshData, idKey]
  );

  return {
    searchText,
    page,
    pageSize,
    safePage,
    totalPages,
    totalItems,
    pageItems,
    loadingData,
    isLoading,
    showFormModal,
    editingItem,
    tableRef,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleCreate,
    handleEdit,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
