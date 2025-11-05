import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await context.params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await context.params;
    const body = await req.json();
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}













// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { z } from "zod";


// const jobUpdateSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   company: z.string().min(1, "Company name is required"),
//   logo: z.string().url().optional().or(z.literal("")),
//   website: z.string().url().optional().or(z.literal("")),
//   location: z.string().min(1, "Location is required"),
//   type: z.string().min(1, "Job type is required"),
//   responsibilities: z.string().optional().nullable(),
//   salary: z.string().optional().nullable(),
//   experience: z.string().optional().nullable(),
//   vacancies: z
//     .union([z.string(), z.number()])
//     .transform((v) => Number(v) || 0),
//   skills: z.string().optional().nullable(),
//   education: z.string().optional().nullable(),
//   benefits: z
//     .union([
//       z.array(z.string()),
//       z.string(),
//       z.null(),
//       z.undefined(),
//     ])
//     .transform((val) => {
//       if (Array.isArray(val)) return val.filter(Boolean);
//       if (typeof val === "string")
//         return val
//           .split(",")
//           .map((b) => b.trim())
//           .filter(Boolean);
//       return [];
//     }),
//   jobplace: z.string().optional().nullable(),
//   deadline: z
//     .union([z.string(), z.date(), z.null(), z.undefined()])
//     .transform((val) => {
//       if (!val) return null;
//       return typeof val === "string" ? new Date(val) : val;
//     }),
// });

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ jobId: string }> }
// ) {
//   try {
//     const { jobId } = await params;
//     const job = await prisma.job.findUnique({
//       where: { id: jobId },
//     });

//     if (!job)
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });

//     return NextResponse.json(job);
//   } catch (err) {
//     console.error("GET error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ jobId: string }> }
// ) {
//   try {
//     const json = await req.json();

//     const { jobId } = await params;

//     const parsed = jobUpdateSchema.parse(json);

//     const updated = await prisma.job.update({
//       where: { id: jobId },
//       data: {
//         ...parsed,
//         updatedAt: new Date(),
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (err) {
//     if (err instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: "Invalid input", details: err.message },
//         { status: 400 }
//       );
//     }

//     console.error("PUT error:", err);
//     return NextResponse.json(
//       { error: "Failed to update job" },
//       { status: 500 }
//     );
//   }
// }












// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function GET(req: Request, context: { params: Promise<{ jobId: string }> }) {
//   try {
//     const { jobId } = await context.params;
//     const job = await prisma.job.findUnique({ where: { id: jobId } });
//     if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     return NextResponse.json(job);
//   } catch (err) {
//     console.error("GET error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function PUT(req: Request, context: { params: Promise<{ jobId: string }> }) {
//   try {
//     const { jobId } = await context.params;
//     const body = await req.json();
//     const updated = await prisma.job.update({
//       where: { id: jobId },
//       data: {
//         ...body,
//         updatedAt: new Date(),
//       },
//     });
//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error("PUT error:", err);
//     return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
//   }
// }

