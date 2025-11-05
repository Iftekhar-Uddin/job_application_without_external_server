import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const formData = await req.formData();
  const tran_id = formData.get("tran_id") as string;
  if (tran_id) {
    const jobId = tran_id.split("-")[0];
    await prisma.payment.updateMany({
      where: { jobId },
      data: { status: "CANCELLED" },
    });
  }
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/jobs`);
}
