// src/helpers/ml-groups/import-group-members-by-cursor.types.ts
export type GroupSubscriber = {
  id?: string
  email: string
  status?: string
  created_at?: string
  updated_at?: string
}

export type PageResult = {
  rows: GroupSubscriber[]
  next?: string
}
