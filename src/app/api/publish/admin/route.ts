import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();

    // Create new job in PENDING state
    const job = await prisma.job.create({
      data: {
        title: data.title,
        company: data.company,
        logo: data.logo,
        website: data.website,
        location: data.location,
        type: data.type,
        responsibilities: data.responsibilities,
        salary: data.salary,
        experience: data.experience,
        vacancies: data.vacancies,
        skills: data.skills,
        education: data.education,
        benefits: data.benefits,
        jobplace: data.jobplace,
        lat: data.lat,
        lng: data.lng,
        deadline: data.deadline ? new Date(data.deadline) : null,
        postedById: user.id,
        status: "PENDING",
      },
    });


    await prisma.payment.create({
      data: {
        jobId: job.id,
        amount: 0,
        provider: "ADMIN",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Job submitted for admin approval.",
      jobId: job.id,
    });

  } catch (error) {
    console.error("Admin approval API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
