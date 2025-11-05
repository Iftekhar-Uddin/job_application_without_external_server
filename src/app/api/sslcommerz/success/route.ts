import { NextResponse } from "next/server";
import SSLCommerz from "sslcommerz-lts";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const tran_id = formData.get("tran_id") as string;
  const val_id = formData.get("val_id") as string;

  if (!tran_id) return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });

  const store_id = process.env.SSLCZ_STORE_ID!;
  const store_passwd = process.env.SSLCZ_STORE_PASSWD!;
  const is_live = process.env.SSLCZ_IS_SANDBOX !== "true";
  const sslcz = new SSLCommerz(store_id, store_passwd, is_live);

  try {
    const validation = await sslcz.validate({ val_id });

    const isSuccess = validation && ["VALID", "VALIDATED", "Completed"].includes(validation.status);

    if (isSuccess) {
      // Extract jobId from tran_id
      const jobId = tran_id.split("-")[0];

      await prisma.job.update({
        where: { id: jobId },
        data: { status: "PUBLISHED" },
      });

      await prisma.payment.updateMany({
        where: { jobId },
        data: { status: "SUCCESS" },
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${jobId}?payment=success`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/post/submit?payment=failed`
      );
    }
  } catch (err) {
    console.error("SSLCommerz validation error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/post/submit?payment=failed`
    );
  }
}
