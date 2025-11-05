import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import JobPostSuccessEmail from "@/app/emails/JobPostSuccessOrRejectEmail";
import AdminJobPostNotificationEmail from "@/app/emails/AdminJobPostNotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export const config = {
  api: { bodyParser: false },
};


export async function POST(req: Request) {
  // const body = await req.text();
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const jobId = session.metadata?.jobId as string | undefined;
      const tranId = session.id;

      if (jobId) {
        await prisma.payment.updateMany({
          where: { jobId },
          data: { status: "SUCCESS", tranId },
        });

        await prisma.job.update({
          where: { id: jobId },
          data: { status: "PUBLISHED" },
        });

        const job = await prisma.job.findFirst({
          where: { id: jobId },
          include: { postedBy: true }
        });

        const email = job?.postedBy.email;
        const name = job?.postedBy.name;
        const jobStatus = job?.status

        const jobUrl = `https://myjobapplication.localhost:44317/jobs/${job?.id}`;
        const formattedDate = new Date(job?.updatedAt as Date).toLocaleDateString();

        await resend.emails.send({
          from: "Job Portal <onboarding@resend.dev>",
          to: email as string,
          subject: "Your Job Post is Live Now!",
          react: JobPostSuccessEmail({
            name: name as string,
            title: job?.title as string,
            company: job?.company as string,
            location: job?.location as string,
            date: formattedDate,
            status: jobStatus as string,
            jobUrl,
          }),
        });

        await resend.emails.send({
          from: "Job Portal <onboarding@resend.dev>",
          to: "iftekharuddin720@gmail.com",
          subject: `New Job Post Live: ${job?.title}`,
          react: AdminJobPostNotificationEmail({
            adminName: "Admin",
            job: {
              title: job?.title as string,
              company: job?.company as string,
              location: job?.location as string,
              createdAt: formattedDate,
              id: job?.id as string,
            },
            user: {
              name: job?.postedBy.name || "Unknown",
              email: job?.postedBy.email as string,
            },
          }),
        });

        console.log(`Sent email to ${job?.postedBy.email as string} and admin@yourdomain.com`);
      }
      return new Response("User And Admin Email Sent Successfully!", { status: 200 });
    }

  } catch (err) {
    console.error("Webhook handling failed:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
