// src/stores/subscribers.ts
"use client";

import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";

export type SortDir = "asc" | "desc";
type Filters = {
  q: string;
  groupId: string | null;
  status: "active" | "unsubscribed" | "any";
};

type TableState = {
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "email";
  sortDir: SortDir;
  selectedIds: Set<string>;
  filters: Filters;

  setQuery: (q: string) => void;
  setGroup: (groupId: string | null) => void;
  setStatus: (s: Filters["status"]) => void;

  setSort: (key: TableState["sortBy"]) => void;
  toggleSortDir: () => void;

  setPage: (p: number) => void;
  setPageSize: (n: number) => void;

  toggleSelected: (id: string) => void;
  clearSelection: () => void;
};

export const useSubscribersTable = create<TableState>()(
  persist(
    devtools(
      subscribeWithSelector((set) => ({
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortDir: "desc" as SortDir,
        selectedIds: new Set<string>(),
        filters: { q: "", groupId: null, status: "any" },

        setQuery: (q) =>
          set(
            produce<TableState>((s) => {
              s.filters.q = q;
              s.page = 1;
            })
          ),
        setGroup: (groupId) =>
          set(
            produce<TableState>((s) => {
              s.filters.groupId = groupId;
              s.page = 1;
            })
          ),
        setStatus: (status) =>
          set(
            produce<TableState>((s) => {
              s.filters.status = status;
              s.page = 1;
            })
          ),

        setSort: (key) => set({ sortBy: key }),
        toggleSortDir: () =>
          set((s) => ({ sortDir: s.sortDir === "asc" ? "desc" : "asc" })),

        setPage: (p) => set({ page: p }),
        setPageSize: (n) => set({ pageSize: n }),

        toggleSelected: (id) =>
          set(
            produce<TableState>((s) => {
              if (s.selectedIds.has(id)) s.selectedIds.delete(id);
              else s.selectedIds.add(id);
            })
          ),
        clearSelection: () => set({ selectedIds: new Set() }),
      }))
    ),
    {
      name: "subscribers-table", // localStorage key
      partialize: (s) => ({
        pageSize: s.pageSize,
        sortBy: s.sortBy,
        sortDir: s.sortDir,
        filters: s.filters,
      }),
    }
  )
);
