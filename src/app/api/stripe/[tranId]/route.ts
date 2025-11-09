import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TranIdSchema = z.object({
  tranId: z.string().uuid(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tranId: string }> }
) {
  try {
    const { tranId } = await params;

    // Validate transaction ID
    const validationResult = TranIdSchema.safeParse({ tranId });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: { 
        tranId,
        provider: "STRIPE",
      },
      include: { 
        job: {
          include: {
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

    // Return sanitized payment data
    const responseData = {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      job: {
        id: payment.job.id,
        title: payment.job.title,
        company: payment.job.company,
        status: payment.job.status,
        postedBy: payment.job.postedBy,
      },
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Payment lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
