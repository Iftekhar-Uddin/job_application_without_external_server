import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create job in PENDING state
  const job = await prisma.job.create({
    data: {
      title: body.title,
      company: body.company,
      type: body.type,
      responsibilities: body.responsibilities,
      salary: body.salary,
      experience: body.experience,
      vacancies: body.vacancies ?? 1,
      skills: body.skills,
      education: body.education,
      benefits: body.benefits ?? [],
      jobplace: body.jobplace,
      location: body.location,
      lat: body.lat,
      lng: body.lng,
      deadline: body.deadline ? new Date(body.deadline) : null,
      postedById: user.id,
      status: "PENDING",
    },
  });

  // Create Stripe Checkout session
  const amount = parseInt(process.env.STRIPE_PRICE_AMOUNT || "50000", 10); // in smallest currency unit
  const currency = process.env.STRIPE_CURRENCY || "BDT";

  const sessionStripe = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: `Job Post: ${job.title}` },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?tranId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/post/submit`,
    metadata: {
      jobId: job.id,
      userId: user.id,
    },
  });

  // Record payment pending
  await prisma.payment.create({
    data: {
      jobId: job.id,
      provider: "STRIPE",
      tranId: sessionStripe.id,
      amount: amount / 100,
      currency: currency.toUpperCase(),
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: sessionStripe.url });
}
