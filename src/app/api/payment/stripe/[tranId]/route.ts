import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TranIdSchema = z.object({
  tranId: z.string().regex(/^cs_(test|live)_[a-zA-Z0-9]+$/, "Invalid Stripe session ID format"),
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
        { error: "Invalid transaction ID" },
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