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
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=cancelled`
    );

  } catch (error) {
    console.error("Payment cancel error:", error);
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
//         cancel_time: new Date().toISOString(),
//         status: "CANCELLED",
//       };

//       await prisma.payment.update({
//         where: { id: payment.id },
//         data: { 
//           status: "CANCELLED",
//           meta: updatedMeta,
//         },
//       });

//       // Keep job as PENDING for potential retry
//     }

//     return NextResponse.redirect(
//       `${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=cancelled`
//     );

//   } catch (error) {
//     console.error("Payment cancel handler error:", error);
//     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/sslcommerz?payment=error`);
//   }
// }
