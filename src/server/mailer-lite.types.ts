// src/server/mailer-lite.types.ts
export type AnyAxios = { data?: any }
export type ListShape<T> = { data?: T[]; meta?: { next_cursor?: string } }
export type SdkListResult<T> = [T[], string | undefined]
