import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
import SSLCommerzPayment from "sslcommerz-lts";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    let deadline: Date | null = null;

    if (body.deadline) {
      const parsed = new Date(body.deadline);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid deadline format" },
          { status: 400 }
        );
      }

      const now = new Date();
      if (parsed < now) {
        return NextResponse.json(
          { error: "Deadline cannot be in the past" },
          { status: 400 }
        );
      }

      deadline = parsed;
    }

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
        deadline,
        postedById: user.id,
        status: "PENDING",
      },
    });

    const store_id = process.env.SSLCZ_STORE_ID!;
    const store_passwd = process.env.SSLCZ_STORE_PASSWD!;
    const is_live = process.env.SSLCZ_IS_SANDBOX !== "true";

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const tranId = `${job.id}-${Date.now()}`;

    const post_body = {
      total_amount: 500,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success?jobId=${job.id}`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/fail?jobId=${job.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/cancel?jobId=${job.id}`,
      cus_name: session.user.name ?? "Guest",
      cus_email: session.user.email,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: "01731615141",
      shipping_method: "NO",
      product_name: job.title,
      product_category: "Job Post",
      product_profile: "general",
      emi_option: 0,
    };

    const apiResponse = await sslcz.init(post_body);

    if (!apiResponse?.GatewayPageURL) {
      return NextResponse.json(
        { error: "Payment initialization failed", details: apiResponse },
        { status: 500 }
      );
    }

    await prisma.payment.create({
      data: {
        jobId: job.id,
        provider: "SSLCOMMERZ",
        tranId: job.id.toString(),
        amount: 500,
        currency: "BDT",
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: apiResponse.GatewayPageURL });
  } catch (error) {
    console.error("SSLCommerz Init Error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed", details: error },
      { status: 500 }
    );
  }
}
