import { NextRequest, NextResponse } from 'next/server'

import { fetchGroupsPage, importGroupMembersByCursor } from '@/helpers/ml-groups'
import { prisma } from '@/server/db'

// --- główny handler ---
export async function POST(req: NextRequest) {
  const limit = 100
  const includeMembers = req.nextUrl.searchParams.get('includeMembers') === 'true'
  // Jeśli kiedyś chcesz członków po cursorze, możesz dodać ?membersMode=cursor i zaimplementować analog wg importu subskrybentów.

  let page = 1
  let importedGroups = 0
  let linkedMemberships = 0

  try {
    while (true) {
      const groups = await fetchGroupsPage(page, limit)
      if (!groups.length) break

      for (const g of groups) {
        // krótka operacja per grupa (bez długich transakcji)
        const group = await prisma.group.upsert({
          where: { mailerLiteId: g.id },
          create: {
            mailerLiteId: g.id,
            name: g.name,
            createdAt: g.created_at ? new Date(g.created_at) : undefined
          },
          update: {
            name: g.name,
            updatedAt: g.updated_at ? new Date(g.updated_at) : undefined
          }
        })
        importedGroups += 1

        if (includeMembers) {
          linkedMemberships += await importGroupMembersByCursor(group.id, g.id, limit)
        }
      }

      if (groups.length < limit) break // ostatnia strona
      page += 1
    }

    return NextResponse.json({ importedGroups, linkedMemberships })
  } catch (e: any) {
    if (e.name === 'HTTPError' && e.response) {
      const detail = await e.response
        .clone()
        .json()
        .catch(() => null)
      console.error('MailerLite error', e.response.status, detail ?? (await e.response.text()))

      return NextResponse.json({ error: 'MailerLite error', detail }, { status: e.response.status })
    }
    console.error(e)

    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
