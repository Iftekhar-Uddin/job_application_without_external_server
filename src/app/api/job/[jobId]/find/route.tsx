import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    return NextResponse.redirect(new URL("/auth/singin", request.url));
  };

  try {
    const { jobId } = await params;
    
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: jobId,
        userId: session?.user?.id,
      },
    })

    return NextResponse.json(existingApplication)
    
  } catch (error) {
    console.error("get applied error: ", error);
    return new NextResponse("Internal server error", { status: 500 });
  }

}