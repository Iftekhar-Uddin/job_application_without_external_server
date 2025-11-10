import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const jobIdSchema = z.object({
  jobId: z.string().regex(/^cmh[a-z0-9]{20,}$/, "Invalid job ID format"),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;


    const validationResult = jobIdSchema.safeParse({ jobId });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: { 
        jobId,
        provider: "SSLCOMMERZ",
      },
      include: { 
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            logo: true,
            website: true,
            location: true,
            type: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Return payment data matching your frontend expectations
    const responseData = {
      id: payment.id,
      tranId: payment.tranId,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      status: payment.status,
      createdAt: payment.createdAt,
      job: payment.job,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Payment lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  
};