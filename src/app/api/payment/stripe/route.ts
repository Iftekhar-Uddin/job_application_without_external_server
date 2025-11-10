import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

// Validation schema
const JobPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  company: z.string().min(1, "Company is required").max(100),
  type: z.string().min(1, "Job type is required"),
  responsibilities: z.string().optional(),
  salary: z.string().min(1, "Salary is required"),
  experience: z.string().optional(),
  vacancies: z.number().int().positive().default(1),
  skills: z.string().optional(),
  education: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  jobplace: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  deadline: z.string().datetime().optional(),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validationResult = JobPostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Get user with transaction
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create job in PENDING state
      const job = await tx.job.create({
        data: {
          title: validatedData.title,
          company: validatedData.company,
          type: validatedData.type,
          responsibilities: validatedData.responsibilities,
          salary: validatedData.salary,
          experience: validatedData.experience,
          vacancies: validatedData.vacancies,
          skills: validatedData.skills,
          education: validatedData.education,
          benefits: validatedData.benefits,
          jobplace: validatedData.jobplace,
          location: validatedData.location,
          lat: validatedData.lat,
          lng: validatedData.lng,
          deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
          postedById: user.id,
          status: "PENDING",
        },
      });

      // Calculate amount and currency
      const amount = parseInt(process.env.STRIPE_PRICE_AMOUNT || "50000", 10);
      const currency = process.env.STRIPE_CURRENCY?.toLowerCase() || "bdt";

      // Create Stripe Checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `Job Post: ${job.title}`,
                description: `Job posting for ${job.company} in ${job.location}`,
                metadata: {
                  job_id: job.id,
                  user_id: user.id,
                },
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/post?cancelled=true`,
        customer_email: user.email!,
        client_reference_id: job.id,
        metadata: {
          jobId: job.id,
          userId: user.id,
          type: "job_posting",
        },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      });

      // Create payment record
      await tx.payment.create({
        data: {
          jobId: job.id,
          provider: "STRIPE",
          tranId: stripeSession.id,
          amount: amount / 100, // Convert to actual currency amount
          currency: currency.toUpperCase(),
          status: "PENDING",
          meta: {
            stripe_session_id: stripeSession.id,
            checkout_url: stripeSession.url,
            expires_at: stripeSession.expires_at,
          },
        },
      });

      return { job, stripeSession };
    });

    // Log successful job creation
    console.log(`Job ${result.job.id} created for user ${user.id}`);

    return NextResponse.json({
      success: true,
      url: result.stripeSession.url,
      sessionId: result.stripeSession.id,
      jobId: result.job.id,
    });

  } catch (error: any) {
    console.error("Stripe checkout creation error:", error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
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









// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/auth";


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function POST(req: Request) {
//   const session = await auth();
//   if (!session?.user?.email)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await req.json();

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user)
//     return NextResponse.json({ error: "User not found" }, { status: 404 });

//   // Create job in PENDING state
//   const job = await prisma.job.create({
//     data: {
//       title: body.title,
//       company: body.company,
//       type: body.type,
//       responsibilities: body.responsibilities,
//       salary: body.salary,
//       experience: body.experience,
//       vacancies: body.vacancies ?? 1,
//       skills: body.skills,
//       education: body.education,
//       benefits: body.benefits ?? [],
//       jobplace: body.jobplace,
//       location: body.location,
//       lat: body.lat,
//       lng: body.lng,
//       deadline: body.deadline ? new Date(body.deadline) : null,
//       postedById: user.id,
//       status: "PENDING",
//     },
//   });

//   // Create Stripe Checkout session
//   const amount = parseInt(process.env.STRIPE_PRICE_AMOUNT || "50000", 10); // in smallest currency unit
//   const currency = process.env.STRIPE_CURRENCY || "BDT";

//   const sessionStripe = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: [
//       {
//         price_data: {
//           currency,
//           product_data: { name: `Job Post: ${job.title}` },
//           unit_amount: amount,
//         },
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?tranId={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/post/submit`,
//     metadata: {
//       jobId: job.id,
//       userId: user.id,
//     },
//   });

//   // Record payment pending
//   await prisma.payment.create({
//     data: {
//       jobId: job.id,
//       provider: "STRIPE",
//       tranId: sessionStripe.id,
//       amount: amount / 100,
//       currency: currency.toUpperCase(),
//       status: "PENDING",
//     },
//   });

//   return NextResponse.json({ url: sessionStripe.url });
// }
