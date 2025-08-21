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
export function sdkList<T>(resp: SdkListResponse<T> | ListShape<T> | T[]): SdkListResult<T> {
  // Accept both Axios-style responses and plain payloads from the SDK
  // 1) AxiosResponse<{ data?: T[]; meta?: { next_cursor?: string } }>
  // 2) AxiosResponse<T[]>
  // 3) Plain { data, meta } object
  // 4) Plain T[]
  let payload: ListShape<T> | T[] | undefined

  // (1) / (2): Axios-like
  const maybeAxios = resp as SdkListResponse<T>
  if (maybeAxios && typeof maybeAxios === 'object' && 'data' in maybeAxios) {
    const d = maybeAxios.data
    if (Array.isArray(d)) {
      payload = d as T[]
    } else if (isListShape<T>(d)) {
      payload = d as ListShape<T>
    } else {
      payload = undefined
    }
  } else if (Array.isArray(resp)) {
    // (4) plain array
    payload = resp as T[]
  } else if (isListShape<T>(resp)) {
    // (3) plain list shape
    payload = resp as ListShape<T>
  } else {
    payload = undefined
  }

  if (Array.isArray(payload)) {
    return [payload, undefined]
  }

  const rows: T[] = Array.isArray((payload as ListShape<T>)?.data)
    ? (payload as ListShape<T>).data!
    : []
  const next = (payload as ListShape<T>)?.meta?.next_cursor

  return [rows, next]
}
