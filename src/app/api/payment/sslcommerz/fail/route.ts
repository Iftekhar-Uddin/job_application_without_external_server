import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tranId = searchParams.get("session");

  if (!tranId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=error`);
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { tranId },
    });

    if (payment && payment.status === "PENDING") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        }),
        prisma.job.update({
          where: { id: payment.jobId },
          data: { status: "REJECTED" },
        }),
      ]);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=failed&tranId=${tranId}`
    );

  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=error`);
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
//     const payment = await prisma.payment.findFirst({
//       where: { tranId },
//     });

//     if (payment) {
//       // Prepare updated meta data
//       const currentMeta = payment.meta as any || {};
//       const updatedMeta = {
//         ...currentMeta,
//         fail_time: new Date().toISOString(),
//         status: "FAILED",
//       };

//       await prisma.payment.update({
//         where: { id: payment.id },
//         data: { 
//           status: "FAILED",
//           meta: updatedMeta,
//         },
//       });

//       // Update job status
//       await prisma.job.update({
//         where: { id: payment.jobId },
//         data: { status: "REJECTED" },
//       });
//     }

//     return NextResponse.redirect(
//       `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=failed&tranId=${tranId}`
//     );

//   } catch (error) {
//     console.error("Payment fail handler error:", error);
//     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=error`);
//   }
// }
