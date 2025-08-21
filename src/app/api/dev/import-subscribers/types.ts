// src/app/api/dev/import-subscribers/types.ts
import { SubscriberObject } from '@mailerlite/mailerlite-nodejs'

export type SdkSubscriber = Omit<SubscriberObject, 'fields'> & {
  fields?: Record<string, unknown>
}
