// src/server/mailer-lite.types.ts
import { AxiosResponse } from 'axios'

export type SdkListResponse<T> = AxiosResponse<ListShape<T> | T[]>

export type ListShape<T> = {
  data?: T[]
  meta?: {
    next_cursor?: string
  }
}

export type SdkListResult<T> = [T[], string | undefined]
