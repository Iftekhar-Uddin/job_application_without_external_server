import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
// import { sendAdminDecisionEmail } from "@/utility/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "Admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const {id} = await params;

  await prisma.job.update({
    where: { id: id },
    data: { status: "PUBLISHED" },
  });

  // Notify job poster
  const job = await prisma.job.findUnique({
    where: { id: id },
    include: { postedBy: true },
  });

  // if (job?.postedBy?.email) {
  //   await sendAdminDecisionEmail(job.postedBy.email, job.title, "approved");
  // }

  return NextResponse.json({ success: true });
}
