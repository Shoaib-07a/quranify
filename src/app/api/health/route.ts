import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureProvisioned, isSeeded } from "@/lib/provision";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Kick off background provisioning if the content DB was reset.
    void ensureProvisioned();
    await db.execute(sql`select 1`);
    const seeded = await isSeeded().catch(() => false);
    return Response.json({ ok: true, seeded });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
