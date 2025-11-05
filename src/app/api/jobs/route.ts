import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JOBS_PER_PAGE = 6;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const jobs = await prisma.job.findMany({
      take: JOBS_PER_PAGE + 1, // take one extra to check for next page
      orderBy: { postedAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    let nextCursor: string | null = null;
    if (jobs.length > JOBS_PER_PAGE) {
      nextCursor = jobs.pop()?.id ?? null;
    }

    // Total jobs in DB (optional, for analytics)
    const totalCount = await prisma.job.count();

    return NextResponse.json({ jobs, nextCursor, totalCount });
  } catch (error) {
    console.error("Error loading jobs:", error);
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 });
  }
}

