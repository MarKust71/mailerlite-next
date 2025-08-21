// src/server/mailer-lite.ts
import MailerLite from '@mailerlite/mailerlite-nodejs'

import { AnyAxios, ListShape, SdkListResult } from './mailer-lite.types'

export const mailerLite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY!
})

// Zwraca [rows, next_cursor]
export function sdkList<T>(resp: unknown): SdkListResult<T> {
  // przypadek: AxiosResponse<{ data: T[]; meta? }>
  const maybeAxios = resp as AnyAxios | undefined
  const payload: ListShape<T> | T[] | undefined = Array.isArray(resp)
    ? (resp as T[])
    : (maybeAxios?.data ?? (resp as any))

  if (Array.isArray(payload)) {
    return [payload, undefined]
  }

  const rows: T[] = Array.isArray(payload?.data) ? (payload!.data as T[]) : []
  const next = payload?.meta?.next_cursor

  return [rows, next]
}
