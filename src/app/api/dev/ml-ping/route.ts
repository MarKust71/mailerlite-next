// src/app/api/dev/ml-ping/route.ts
import { NextResponse } from "next/server";
import { ml } from "@/server/mailerLite";

export async function GET() {
  // Minimalny ping – bez paginacji
  const res = await ml.get("subscribers").json<any>();
  const rows = Array.isArray(res) ? res : res?.data ?? [];
  return NextResponse.json({ remoteCount: rows.length, sample: rows[0] ?? null });
}
