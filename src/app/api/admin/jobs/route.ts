// app/api/admin/jobs/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "Admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const jobs = await prisma.job.findMany({
    where: { status: "PENDING" },
    include: {
      payments: true,
      postedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { postedAt: "desc" },
  });
  return NextResponse.json(jobs);
}
