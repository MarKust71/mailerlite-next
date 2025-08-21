// src/app/api/dev/import-subscribers/types.ts
export type SdkSubscriber = {
  id?: string
  email: string
  status?: string
  fields?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}
