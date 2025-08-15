// ML może zwrócić tablicę lub obiekt { data, meta }
export type MLListResponse<T> =
  | T[]
  | {
      data?: T[]
      meta?: { next_cursor?: string | null; [k: string]: unknown }
      total?: number
    }

export type MLSubscriber = {
  id: string
  email: string
  name?: string | null
  status?: string | null
  fields?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
}
