// src/app/api/dev/ml-ping/route.ts
import { NextResponse } from 'next/server'

import { SdkSubscriber } from '@/app/api/dev/import-subscribers/types'
import { mailerLite, sdkList } from '@/server/mailer-lite'

export async function GET() {
  // Minimalny ping – bez paginacji
  const res = await mailerLite.subscribers.get({ limit: 50 })
  const [rows] = sdkList<SdkSubscriber>(res)

  return NextResponse.json({ remoteCount: rows.length, sample: rows[0] ?? null })
}
