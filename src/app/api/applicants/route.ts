import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

    const applicants = await prisma.application.findMany({
      where: { jobId },
      include: {
        user: true,
        job: true,
      },
      orderBy: { appliedAt: "desc" },
    });

    // Sanitize or shape data as needed before returning
    const payload = applicants.map((a) => ({
      id: a.id,
      status: a.status,
      appliedAt: a.appliedAt,
      user: {
        id: a.user?.id,
        name: a.user?.name,
        email: a.user?.email,
        image: a.user?.image ?? null,
        education: a.user?.education ?? null,
        skills: a.user?.skills ?? null,
        experience: a.user?.experience ?? null,
        previousInstitute: a.user?.previousInstitution
      },
      job: {
        id: a.job?.id,
        title: a.job?.title,
        company: a.job?.company,
        logo: a.job?.logo ?? null,
      },
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Applicants API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
