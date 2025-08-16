export type SortDir = 'asc' | 'desc'

export type Filters = {
  q: string
  groupId: string | null
  status: 'active' | 'unsubscribed' | 'any'
}

export type TableState = {
  page: number
  pageSize: number
  sortBy: 'createdAt' | 'email'
  sortDir: SortDir
  selectedIds: Set<string>
  filters: Filters

  setQuery: (q: string) => void
  setGroup: (groupId: string | null) => void
  setStatus: (s: Filters['status']) => void

  setSort: (key: TableState['sortBy']) => void
  toggleSortDir: () => void

  setPage: (p: number) => void
  setPageSize: (n: number) => void

  toggleSelected: (id: string) => void
  clearSelection: () => void
}
