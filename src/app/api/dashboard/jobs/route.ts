import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const jobs = await prisma.job.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { postedAt: "desc" },
  });
  return NextResponse.json(jobs);
}
