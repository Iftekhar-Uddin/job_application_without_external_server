import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import JobPostSuccessEmail from "@/app/emails/JobPostSuccessOrRejectEmail";
import AdminJobPostNotificationEmail from "@/app/emails/AdminJobPostNotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

function serializeStripeObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  
  // Handle Stripe objects by converting to plain object
  const plainObject: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      plainObject[key] = serializeStripeObject(obj[key]);
    } else {
      plainObject[key] = obj[key];
    }
  }
  return plainObject;
}

// Webhook event handlers
const webhookHandlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  "checkout.session.completed": handleCheckoutSessionCompleted,
  "checkout.session.expired": handleCheckoutSessionExpired,
  "payment_intent.payment_failed": handlePaymentFailed,
};

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const jobId = session.metadata?.jobId;
  const userId = session.metadata?.userId;

  if (!jobId || !userId) {
    console.error("Missing metadata in completed session:", session.id);
    throw new Error("Missing required metadata");
  }

  // Use transaction for data consistency
  await prisma.$transaction(async (tx) => {
    // Update payment status
    const paymentUpdate = await tx.payment.updateMany({
      where: {
        jobId,
        tranId: session.id,
        status: "PENDING",
      },
      data: {
        status: "SUCCESS",
        meta: {
          stripe_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          customer_email: session.customer_email,
          customer_details: session.customer_details ? {
            email: session.customer_details.email,
            name: session.customer_details.name,
            phone: session.customer_details.phone,
          } : null,
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status,
          expires_at: session.expires_at,
          client_reference_id: session.client_reference_id,
          metadata: session.metadata ? serializeStripeObject(session.metadata) : null,
          succeeded_at: new Date().toISOString(),
          webhook_processed_at: new Date().toISOString(),
        },
      },
    });

    if (paymentUpdate.count === 0) {
      throw new Error(`Payment not found or already processed for job ${jobId}`);
    }

    // Update job status to PUBLISHED
    await tx.job.update({
      where: {
        id: jobId,
        postedById: userId,
      },
      data: {
        status: "PUBLISHED",
      },
    });

    // Create notification for user
    await tx.notification.create({
      data: {
        receiverId: userId,
        senderId: "system",
        title: "Payment Successful",
        body: `Your job post "${session.metadata?.jobTitle || 'Unknown Job'}" has been published successfully.`,
        data: {
          type: "payment_success",
          jobId,
          sessionId: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase(),
        },
      },
    });
  });

  // Send emails (non-blocking)
  await sendPostPaymentEmails(jobId, session.id);
}

async function handleCheckoutSessionExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const jobId = session.metadata?.jobId;

  if (!jobId) return;

  await prisma.$transaction(async (tx) => {
    // Update payment status to FAILED
    await tx.payment.updateMany({
      where: {
        jobId,
        tranId: session.id,
        status: "PENDING",
      },
      data: {
        status: "FAILED",
        meta: {
          reason: "session_expired",
          expired_at: session.expires_at,
        },
      },
    });

    // Optionally update job status or leave as PENDING for retry
    // await tx.job.update({
    //   where: { id: jobId },
    //   data: { status: "EXPIRED" },
    // });
  });
}

async function handlePaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  // Find the session associated with this payment intent
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
  });

  if (sessions.data.length === 0) return;

  const session = sessions.data[0];
  const jobId = session.metadata?.jobId;

  if (!jobId) return;

  await prisma.payment.updateMany({
    where: {
      jobId,
      tranId: session.id,
    },
    data: {
      status: "FAILED",
      meta: {
        reason: "payment_failed",
        stripe_payment_intent_id: paymentIntent.id,
        failure_message: paymentIntent.last_payment_error?.message,
        failure_code: paymentIntent.last_payment_error?.code,
        declined_code: paymentIntent.last_payment_error?.decline_code,
        failed_at: new Date().toISOString(),
      },
    },
  });
}

async function sendPostPaymentEmails(jobId: string, sessionId: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!job || !job.postedBy.email) {
      console.error(`Job or user email not found for job ${jobId}`);
      return;
    }

    const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}`;
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send email to job poster
    await resend.emails.send({
      from: `Job Portal <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
      to: job.postedBy.email,
      subject: "Your Job Post is Live Now!",
      react: JobPostSuccessEmail({
        name: job.postedBy.name || "there",
        title: job.title,
        company: job.company,
        location: job.location,
        date: formattedDate,
        status: job.status,
        jobUrl,
      }),
    });

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "iftekharuddin720@gmail.com";
    await resend.emails.send({
      from: `Job Portal <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
      to: adminEmail,
      subject: `New Job Post Published: ${job.title}`,
      react: AdminJobPostNotificationEmail({
        adminName: "Admin",
        job: {
          title: job.title,
          company: job.company,
          location: job.location,
          createdAt: formattedDate,
          id: job.id,
        },
        user: {
          name: job.postedBy.name || "Unknown User",
          email: job.postedBy.email,
        },
      }),
    });

    console.log(`Success emails sent for job ${jobId}`);
  } catch (emailError) {
    // Log but don't fail the webhook if emails fail
    console.error("Failed to send post-payment emails:", emailError);
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    const handler = webhookHandlers[event.type];
    
    if (handler) {
      await handler(event);
      console.log(`Successfully processed webhook event: ${event.type}`);
    } else {
      console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook handler failed for ${event.type}:`, error);
    
    // Return 200 to Stripe to prevent retries for logical errors
    // Only return error for technical failures that should be retried
    if (error.message.includes("Missing required metadata") || 
        error.message.includes("Payment not found")) {
      return NextResponse.json({ received: true }); // Don't retry
    }

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}









// import Stripe from "stripe";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { Resend } from "resend";
// import JobPostSuccessEmail from "@/app/emails/JobPostSuccessOrRejectEmail";
// import AdminJobPostNotificationEmail from "@/app/emails/AdminJobPostNotificationEmail";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// export const config = {
//   api: { bodyParser: false },
// };


// export async function POST(req: Request) {
//   // const body = await req.text();
//   const buf = await req.arrayBuffer();
//   const rawBody = Buffer.from(buf);
//   const signature = req.headers.get("stripe-signature") || "";

//   let event: Stripe.Event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err: any) {
//     console.error("Webhook signature verification failed:", err.message);
//     return new NextResponse("Invalid signature", { status: 400 });
//   }

//   try {
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const jobId = session.metadata?.jobId as string | undefined;
//       const tranId = session.id;

//       if (jobId) {
//         await prisma.payment.updateMany({
//           where: { jobId },
//           data: { status: "SUCCESS", tranId },
//         });

//         await prisma.job.update({
//           where: { id: jobId },
//           data: { status: "PUBLISHED" },
//         });

//         const job = await prisma.job.findFirst({
//           where: { id: jobId },
//           include: { postedBy: true }
//         });

//         const email = job?.postedBy.email;
//         const name = job?.postedBy.name;
//         const jobStatus = job?.status

//         const jobUrl = `https://my-job-application.vercel.app/jobs/${job?.id}`;
//         const formattedDate = new Date(job?.updatedAt as Date).toLocaleDateString();

//         await resend.emails.send({
//           from: "Job Portal <onboarding@resend.dev>",
//           to: email as string,
//           subject: "Your Job Post is Live Now!",
//           react: JobPostSuccessEmail({
//             name: name as string,
//             title: job?.title as string,
//             company: job?.company as string,
//             location: job?.location as string,
//             date: formattedDate,
//             status: jobStatus as string,
//             jobUrl,
//           }),
//         });

//         await resend.emails.send({
//           from: "Job Portal <onboarding@resend.dev>",
//           to: "iftekharuddin720@gmail.com",
//           subject: `New Job Post Live: ${job?.title}`,
//           react: AdminJobPostNotificationEmail({
//             adminName: "Admin",
//             job: {
//               title: job?.title as string,
//               company: job?.company as string,
//               location: job?.location as string,
//               createdAt: formattedDate,
//               id: job?.id as string,
//             },
//             user: {
//               name: job?.postedBy.name || "Unknown",
//               email: job?.postedBy.email as string,
//             },
//           }),
//         });

//         console.log(`Sent email to ${job?.postedBy.email as string} and admin@yourdomain.com`);
//       }
//       return new Response("User And Admin Email Sent Successfully!", { status: 200 });
//     }

//   } catch (err) {
//     console.error("Webhook handling failed:", err);
//     return new NextResponse("Webhook handler error", { status: 500 });
//   }
//   return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
// }
