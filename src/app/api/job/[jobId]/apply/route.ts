import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {

  const session = await auth();

  if (!session?.user || !session.user.id) {
    return NextResponse.redirect(new URL("/auth/singin", request.url));
  }

  try {
    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({message:"job not found"}, { status: 404 });
    }

    if(session.user.id === job.postedById){
      return NextResponse.json({message:"You can't apply to your own job!"}, { status: 404 })
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: jobId,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json({message:"You have already applied to this job."}, {
        status: 400,
      });

    } else {
      const application = await prisma.application.create({
        data: {
          jobId: jobId,
          userId: session.user.id,
          status: "Pending",
        },
      });

      return NextResponse.json(application);
    }

  } catch (error) {
    return NextResponse.json({message:"Internal server error"}, { status: 500 });
  }
}
