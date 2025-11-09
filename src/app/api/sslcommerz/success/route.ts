import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tranId = searchParams.get("session");

  if (!tranId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz/failed`);
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { tranId },
    });

    if (!payment) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz/failed`);
    }

    // Update payment and job status
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      }),
      prisma.job.update({
        where: { id: payment.jobId },
        data: { status: "PUBLISHED" },
      }),
    ]);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz/success?tranId=${tranId}`
    );

  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz`);
  }
}


















// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const tranId = searchParams.get("session");

//   if (!tranId) {
//     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=error`);
//   }

//   try {
//     // Wait a moment for IPN to process
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     const payment = await prisma.payment.findFirst({
//       where: { tranId },
//       include: { job: true },
//     });

//     if (!payment) {
//       return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=invalid`);
//     }

//     // Check if IPN already processed this
//     if (payment.status === "SUCCESS") {
//       return NextResponse.redirect(
//         `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=success&jobId=${payment.jobId}`
//       );
//     }

//     // If IPN hasn't processed yet, update based on redirect
//     const currentMeta = (payment.meta as any) || {};
//     const updatedMeta = {
//       ...currentMeta,
//       success_redirect_time: new Date().toISOString(),
//     };

//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: { 
//         status: "SUCCESS",
//         meta: updatedMeta,
//       },
//     });

//     await prisma.job.update({
//       where: { id: payment.jobId },
//       data: { status: "PUBLISHED" },
//     });

//     return NextResponse.redirect(
//       `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=success&jobId=${payment.jobId}`
//     );

//   } catch (error) {
//     console.error("Payment success handler error:", error);
//     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=error`);
//   }
// }