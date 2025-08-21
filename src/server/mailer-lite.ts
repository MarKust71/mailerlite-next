// src/server/mailer-lite.ts
import MailerLite from '@mailerlite/mailerlite-nodejs'

import { ListShape, SdkListResponse, SdkListResult } from './mailer-lite.types'

export const mailerLite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY!
})

function isListShape<T>(x: unknown): x is ListShape<T> {
  return typeof x === 'object' && x !== null && 'data' in x
}

// Zwraca [rows, next_cursor]
export function sdkList<T>(resp: unknown): SdkListResult<T> {
  // przypadek: AxiosResponse<{ data: T[]; meta? }>
  const maybeAxios = resp as SdkListResponse<T> | undefined
  const data = maybeAxios?.data ?? resp

  let payload: ListShape<T> | T[] | undefined

  if (Array.isArray(data)) {
    payload = data
  } else if (isListShape<T>(data)) {
    payload = data
  } else {
    payload = undefined
  }

  if (Array.isArray(payload)) {
    return [payload, undefined]
  }

  const rows: T[] = Array.isArray(payload?.data) ? payload!.data : []
  const next = payload?.meta?.next_cursor

  return [rows, next]
}
