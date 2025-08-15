// src/app/api/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/server/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? '20'), 100)
  const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'email'
  const sortDir = (searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc'
  const q = searchParams.get('q') ?? ''
  const groupId = searchParams.get('groupId')
  const status = searchParams.get('status') // active | unsubscribed | null

  const where: any = {}
  if (q)
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } }
    ]
  if (status) where.status = status

  if (groupId) {
    where.groups = { some: { groupId } }
  }

  const [items, total] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      include: { groups: true, fields: { include: { customField: true } } },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.subscriber.count({ where })
  ])

  return NextResponse.json({ items, total })
}
