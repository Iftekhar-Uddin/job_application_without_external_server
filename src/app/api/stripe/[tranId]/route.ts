import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  const payment = await prisma.payment.findFirst({
    where: { tranId: id },
    include: { job: true },
  });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(payment);
}
