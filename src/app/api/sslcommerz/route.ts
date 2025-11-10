import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, company, location, salary } = body;

    // Basic validation
    if (!title || !company || !location) {
      return NextResponse.json(
        { error: "Title, company, and location are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        salary: salary || "Negotiable",
        type: body.type || "Full-time",
        responsibilities: body.responsibilities || "",
        experience: body.experience || "",
        vacancies: body.vacancies || 1,
        skills: body.skills || "",
        education: body.education || "",
        benefits: body.benefits || [],
        jobplace: body.jobplace || "",
        lat: body.lat || null,
        lng: body.lng || null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        postedById: user.id,
        status: "PENDING",
      },
    });

    // SSLCommerz configuration
    const store_id = process.env.SSLCZ_STORE_ID;
    const store_passwd = process.env.SSLCZ_STORE_PASSWD;
    const app_url = process.env.NEXT_PUBLIC_APP_URL;

    if (!store_id || !store_passwd || !app_url) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const tranId = `JOB-${job.id}-${Date.now()}`;
    const amount = 500;

    // SSLCommerz payment data
    const paymentData = {
      store_id,
      store_passwd,
      total_amount: amount,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${app_url}/api/payment/sslcommerz/success?session=${tranId}`,
      fail_url: `${app_url}/api/payment/sslcommerz/fail?session=${tranId}`,
      cancel_url: `${app_url}/jobs/post?cancelled=true`,
      cus_name: session.user.name || "Customer",
      cus_email: session.user.email,
      cus_phone: "01731615141",
      cus_add1: "N/A",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: `Job Post: ${title.substring(0, 50)}`,
      product_category: "Job Posting",
      product_profile: "general",
    };

    // Initiate SSLCommerz payment
    const response = await fetch(
      `https://sandbox.sslcommerz.com/gwprocess/v3/api.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(paymentData as any),
      }
    );

    const result = await response.json();

    console.log("SSLCommerz Response:", result); // Add this for debugging

    // Fix: Check for successful payment initiation more flexibly
    if (!result.status || result.status === "FAILED" || result.status === "INVALID") {
      // Update job status if payment fails
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json(
        { error: result.failedreason || "Payment initiation failed" },
        { status: 400 }
      );
    }

    // If we have a GatewayPageURL, the payment initiation was successful
    if (result.GatewayPageURL) {
      // Create payment record
      await prisma.payment.create({
        data: {
          jobId: job.id,
          provider: "SSLCOMMERZ",
          tranId,
          amount,
          currency: "BDT",
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        gatewayPageURL: result.GatewayPageURL,
        tranId,
        jobId: job.id,
      });
    } else {
      // Handle case where GatewayPageURL is missing
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json(
        { error: "Payment gateway URL not received" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("SSLCommerz error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}











// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import SSLCommerzPayment from "sslcommerz-lts";
// import { auth } from "@/auth";

// export const runtime = "edge"; // Better for payment APIs

// interface SSLCommerzInitResponse {
//   GatewayPageURL?: string;
//   status?: string;
//   failedreason?: string;
//   [key: string]: any; // Add index signature
// }

// // Helper function to safely convert to Prisma JSON value
// const toPrismaJson = (data: any): any => {
//   if (data === null || data === undefined) return null;
//   if (typeof data === "object") {
//     return JSON.parse(JSON.stringify(data)); // Ensure it's plain JSON
//   }
//   return data;
// };


// export async function POST(req: Request) {
//   const session = await auth();

//   if (!session?.user?.email) {
//     return NextResponse.json(
//       { error: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const body = await req.json();

//   try {
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Validate required environment variables
//     const store_id = process.env.SSLCZ_STORE_ID;
//     const store_passwd = process.env.SSLCZ_STORE_PASSWD;
//     const app_url = process.env.NEXT_PUBLIC_APP_URL;

//     if (!store_id || !store_passwd || !app_url) {
//       console.error("Missing SSLCommerz environment variables");
//       return NextResponse.json(
//         { error: "Payment configuration error" },
//         { status: 500 }
//       );
//     }

//     // Validate job data
//     if (!body.title || !body.company || !body.location) {
//       return NextResponse.json(
//         { error: "Missing required job fields" },
//         { status: 400 }
//       );
//     }

//     // Validate and parse deadline
//     let deadline: Date | null = null;
//     if (body.deadline) {
//       const parsedDeadline = new Date(body.deadline);
//       if (isNaN(parsedDeadline.getTime())) {
//         return NextResponse.json(
//           { error: "Invalid deadline format" },
//           { status: 400 }
//         );
//       }

//       const now = new Date();
//       if (parsedDeadline < now) {
//         return NextResponse.json(
//           { error: "Deadline cannot be in the past" },
//           { status: 400 }
//         );
//       }
//       deadline = parsedDeadline;
//     }

//     // Create job in database
//     const job = await prisma.job.create({
//       data: {
//         title: body.title,
//         company: body.company,
//         type: body.type,
//         responsibilities: body.responsibilities,
//         salary: body.salary,
//         experience: body.experience,
//         vacancies: body.vacancies ?? 1,
//         skills: body.skills,
//         education: body.education,
//         benefits: body.benefits ?? [],
//         jobplace: body.jobplace,
//         location: body.location,
//         lat: body.lat,
//         lng: body.lng,
//         deadline,
//         postedById: user.id,
//         status: "PENDING",
//       },
//     });

//     // SSLCommerz configuration
//     const is_live = process.env.SSLCZ_IS_LIVE;
//     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

//     // Generate unique transaction ID
//     const tranId = `JOB-${job.id}-${Date.now()}`;
//     const amount = 500;

//     const post_body = {
//       total_amount: amount,
//       currency: "BDT",
//       tran_id: tranId,
//       success_url: `${app_url}/api/payment/sslcommerz/success?session=${tranId}`,
//       fail_url: `${app_url}/api/payment/sslcommerz/fail?session=${tranId}`,
//       cancel_url: `${app_url}/api/payment/sslcommerz/cancel?session=${tranId}`,
//       ipn_url: `${app_url}/api/payment/sslcommerz/ipn`,
//       cus_name: session.user.name?.substring(0, 50) || "Customer",
//       cus_email: session.user.email.substring(0, 50),
//       cus_add1: body.location?.substring(0, 50) || "Dhaka",
//       cus_add2: "",
//       cus_city: "Dhaka",
//       cus_state: "Dhaka",
//       cus_postcode: "1200",
//       cus_country: "Bangladesh",
//       cus_phone: "01731615141",
//       // cus_phone: user.phone?.substring(0, 20) || "01700000000",
//       cus_fax: "",
//       shipping_method: "NO",
//       product_name: `Job Post: ${body.title}`.substring(0, 50),
//       product_category: "Job Posting",
//       product_profile: "general",
//       product_amount: amount,
//       discount_amount: 0,
//       emi_option: 0,
//       emi_max_inst_option: 0,
//       emi_selected_inst: 0,
//       value_a: job.id, // Store job ID for reference
//       value_b: user.id, // Store user ID for reference
//       value_c: "job_posting",
//       value_d: "web",
//     };

//     // Initialize payment
//     const apiResponse: SSLCommerzInitResponse = await sslcz.init(post_body);

//     if (!apiResponse?.GatewayPageURL || apiResponse.status !== "SUCCESS") {
//       console.error("SSLCommerz Init Failed:", apiResponse);

//       // Update job status to failed
//       await prisma.job.update({
//         where: { id: job.id },
//         data: { status: "REJECTED" }
//       });

//       return NextResponse.json(
//         {
//           error: "Payment initialization failed",
//           details: apiResponse.failedreason || "Unknown error"
//         },
//         { status: 500 }
//       );
//     };

//     // Prepare meta data for Prisma JSON field
//     const metaData = {
//       init_response: toPrismaJson(apiResponse),
//       user_id: user.id,
//       job_title: body.title,
//       init_time: new Date().toISOString(),
//     };

//     // Create payment record
//     await prisma.payment.create({
//       data: {
//         jobId: job.id,
//         provider: "SSLCOMMERZ",
//         tranId: tranId,
//         amount: amount,
//         currency: "BDT",
//         status: "PENDING",
//         meta: metaData,
//       },
//     });

//     return NextResponse.json({
//       GatewayPageURL: apiResponse.GatewayPageURL,
//       tranId: tranId,
//     });

//   } catch (error) {
//     console.error("SSLCommerz Payment Error:", error);

//     return NextResponse.json(
//       {
//         error: "Payment processing failed",
//         details: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 }
//     );
//   }
// }
