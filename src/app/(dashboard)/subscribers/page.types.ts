import { CustomField, Subscriber, SubscriberFieldValue, SubscriberGroup } from '@prisma/client'

/** Typ encji z relacjami, tak jak zwraca API */
export type SubscriberWithRelations = Subscriber & {
  groups: SubscriberGroup[]
  fields: (SubscriberFieldValue & { customField: CustomField })[]
}

/** Kształt odpowiedzi /api/subscribers */
export type SubscribersResponse = {
  items: SubscriberWithRelations[]
  total: number
}
