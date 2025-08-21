import { SdkSubscriber } from '@/app/api/dev/import-subscribers/types'
import { mailerLite, sdkList } from '@/server/mailer-lite'
import { SdkListResult } from '@/server/mailer-lite.types'

const limit = 100

export async function fetchSubscribersPage(c?: string) {
  const resp = await mailerLite.subscribers.get({ limit, cursor: c })
  const [rows, next]: SdkListResult<SdkSubscriber> = sdkList<SdkSubscriber>(resp)

  return { rows, next }
}
