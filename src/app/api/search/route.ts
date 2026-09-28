import { NextRequest } from "next/server";
import { searchAll } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const results = await searchAll(q);
    return Response.json(results);
  } catch {
    return Response.json(
      { surahs: [], ayahs: [], hadiths: [], duas: [], azkar: [], names: [] },
      { status: 200 },
    );
  }
}
