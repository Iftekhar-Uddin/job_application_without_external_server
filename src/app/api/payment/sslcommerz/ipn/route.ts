import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    
    const tranId = data.tran_id as string;
    const status = data.status as string;

    if (!tranId) {
      return NextResponse.json({ error: "No transaction ID" }, { status: 400 });
    }

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: { tranId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Handle payment status
    if (status === "VALID" || status === "VALIDATED") {
      if (payment.status !== "SUCCESS") {
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
      }
    } 
    else if (status === "FAILED" || status === "CANCELLED") {
      if (payment.status === "PENDING") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: status === "CANCELLED" ? "CANCELLED" : "FAILED" 
          },
        });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("IPN error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ active: true });
}
















// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";


// // Verify SSLCommerz IPN request
// function verifyIPN(data: any, storePass: string): boolean {
//   try {
//     const verifySign = data.verify_sign;
//     const verifyKey = data.verify_key;
    
//     if (!verifySign || !verifyKey) return false;

//     const keys = verifyKey.split(',');
//     const verifyData: { [key: string]: string } = {};
    
//     keys.forEach((key: string) => {
//       if (data[key]) {
//         verifyData[key] = data[key];
//       }
//     });

//     // Create verification string
//     const verifyString = Object.values(verifyData).join('') + storePass;
//     const generatedSign = crypto.createHash('md5').update(verifyString).digest('hex');

//     return generatedSign === verifySign;
//   } catch (error) {
//     console.error("IPN verification error:", error);
//     return false;
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const data = Object.fromEntries(formData.entries());
    
//     console.log("IPN Received:", data);

//     const tranId = data.tran_id as string;
//     const status = data.status as string;
//     const amount = data.currency_amount as string;

//     if (!tranId) {
//       return NextResponse.json({ error: "No transaction ID" }, { status: 400 });
//     }

//     // Verify IPN request (optional but recommended for security)
//     const storePass = process.env.SSLCZ_STORE_PASSWD;
//     if (storePass && !verifyIPN(data, storePass)) {
//       console.error("IPN verification failed");
//       return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//     }

//     // Find payment
//     const payment = await prisma.payment.findFirst({
//       where: { tranId },
//       include: { job: true },
//     });

//     if (!payment) {
//       console.error("Payment not found for tranId:", tranId);
//       return NextResponse.json({ error: "Payment not found" }, { status: 404 });
//     }

//     // Prepare updated meta data
//     const currentMeta = (payment.meta as any) || {};
//     const updatedMeta = {
//       ...currentMeta,
//       ipn_data: data,
//       ipn_time: new Date().toISOString(),
//       ipn_status: status,
//     };

//     // Handle different statuses
//     switch (status) {
//       case "VALID":
//       case "VALIDATED":
//         if (payment.status !== "SUCCESS") {
//           await prisma.payment.update({
//             where: { id: payment.id },
//             data: { 
//               status: "SUCCESS",
//               meta: updatedMeta,
//             },
//           });

//           await prisma.job.update({
//             where: { id: payment.jobId },
//             data: { status: "PUBLISHED" },
//           });

//           console.log(`Payment ${tranId} marked as SUCCESS via IPN`);
//         }
//         break;

//       case "FAILED":
//       case "CANCELLED":
//       case "EXPIRED":
//         if (payment.status !== "FAILED" && payment.status !== "CANCELLED") {
//           await prisma.payment.update({
//             where: { id: payment.id },
//             data: { 
//               status: status === "CANCELLED" ? "CANCELLED" : "FAILED",
//               meta: updatedMeta,
//             },
//           });

//           await prisma.job.update({
//             where: { id: payment.jobId },
//             data: { status: "REJECTED" },
//           });

//           console.log(`Payment ${tranId} marked as ${status} via IPN`);
//         }
//         break;

//       case "PENDING":
//       case "UNATTEMPTED":
//         // Keep as pending, no action needed
//         await prisma.payment.update({
//           where: { id: payment.id },
//           data: { 
//             meta: updatedMeta,
//           },
//         });
//         break;

//       default:
//         console.log(`Unknown IPN status: ${status} for tranId: ${tranId}`);
//     }

//     return NextResponse.json({ received: true, status: "processed" });

//   } catch (error) {
//     console.error("IPN handler error:", error);
//     return NextResponse.json({ error: "IPN processing failed" }, { status: 500 });
//   }
// }

// // Also handle GET requests (SSLCommerz might use GET for verification)
// export async function GET(req: Request) {
//   return NextResponse.json({ message: "IPN endpoint is active" });
// }



























// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";

// // Define types for SSLCommerz IPN data
// interface SSLCommerzIPNData {
//   [key: string]: string;
//   tran_id: string;
//   status: string;
//   currency_amount?: string;
//   verify_sign?: string;
//   verify_key?: string;
// }

// // Verify SSLCommerz IPN request
// function verifyIPN(data: SSLCommerzIPNData, storePass: string): boolean {
//   try {
//     const verifySign = data.verify_sign;
//     const verifyKey = data.verify_key;
    
//     if (!verifySign || !verifyKey) return false;

//     const keys = verifyKey.split(',');
//     const verifyData: { [key: string]: string } = {};
    
//     keys.forEach((key: string) => { // Explicitly type the key parameter
//       if (data[key]) {
//         verifyData[key] = data[key];
//       }
//     });

//     // Create verification string
//     const verifyString = Object.values(verifyData).join('') + storePass;
//     const generatedSign = crypto.createHash('md5').update(verifyString).digest('hex');

//     return generatedSign === verifySign;
//   } catch (error) {
//     console.error("IPN verification error:", error);
//     return false;
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const entries: [string, FormDataEntryValue][] = Array.from(formData.entries());
    
//     // Convert FormData to typed object
//     const data: SSLCommerzIPNData = entries.reduce((acc, [key, value]) => {
//       acc[key] = value.toString();
//       return acc;
//     }, {} as SSLCommerzIPNData);
    
//     console.log("IPN Received:", data);

//     const tranId = data.tran_id;
//     const status = data.status;
//     const amount = data.currency_amount;

//     if (!tranId) {
//       return NextResponse.json({ error: "No transaction ID" }, { status: 400 });
//     }

//     // Verify IPN request (optional but recommended for security)
//     const storePass = process.env.SSLCZ_STORE_PASSWD;
//     if (storePass && !verifyIPN(data, storePass)) {
//       console.error("IPN verification failed");
//       return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//     }

//     // Find payment
//     const payment = await prisma.payment.findFirst({
//       where: { tranId },
//       include: { job: true },
//     });

//     if (!payment) {
//       console.error("Payment not found for tranId:", tranId);
//       return NextResponse.json({ error: "Payment not found" }, { status: 404 });
//     }

//     // Define type for meta data
//     interface PaymentMeta {
//       ipn_data?: SSLCommerzIPNData;
//       ipn_time?: string;
//       ipn_status?: string;
//       [key: string]: any; // Allow other properties
//     }

//     // Prepare updated meta data
//     const currentMeta: PaymentMeta = (payment.meta as PaymentMeta) || {};
//     const updatedMeta: PaymentMeta = {
//       ...currentMeta,
//       ipn_data: data,
//       ipn_time: new Date().toISOString(),
//       ipn_status: status,
//     };

//     // Handle different statuses
//     switch (status) {
//       case "VALID":
//       case "VALIDATED":
//         if (payment.status !== "SUCCESS") {
//           await prisma.payment.update({
//             where: { id: payment.id },
//             data: { 
//               status: "SUCCESS",
//               meta: updatedMeta as any, // Type assertion for Prisma
//             },
//           });

//           await prisma.job.update({
//             where: { id: payment.jobId },
//             data: { status: "PUBLISHED" },
//           });

//           console.log(`Payment ${tranId} marked as SUCCESS via IPN`);
//         }
//         break;

//       case "FAILED":
//       case "CANCELLED":
//       case "EXPIRED":
//         if (payment.status !== "FAILED" && payment.status !== "CANCELLED") {
//           const paymentStatus = status === "CANCELLED" ? "CANCELLED" : "FAILED";
          
//           await prisma.payment.update({
//             where: { id: payment.id },
//             data: { 
//               status: paymentStatus,
//               meta: updatedMeta as any,
//             },
//           });

//           await prisma.job.update({
//             where: { id: payment.jobId },
//             data: { status: "REJECTED" },
//           });

//           console.log(`Payment ${tranId} marked as ${paymentStatus} via IPN`);
//         }
//         break;

//       case "PENDING":
//       case "UNATTEMPTED":
//         // Keep as pending, no action needed
//         await prisma.payment.update({
//           where: { id: payment.id },
//           data: { 
//             meta: updatedMeta as any,
//           },
//         });
//         break;

//       default:
//         console.log(`Unknown IPN status: ${status} for tranId: ${tranId}`);
//     }

//     return NextResponse.json({ received: true, status: "processed" });

//   } catch (error) {
//     console.error("IPN handler error:", error);
//     return NextResponse.json({ error: "IPN processing failed" }, { status: 500 });
//   }
// }

// // Also handle GET requests (SSLCommerz might use GET for verification)
// export async function GET(req: Request) {
//   return NextResponse.json({ message: "IPN endpoint is active" });
// }