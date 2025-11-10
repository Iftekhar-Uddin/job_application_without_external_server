"use server"

import JobPostSuccessEmail from "@/app/emails/JobPostSuccessOrRejectEmail";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const EmailNotify = async (jobId: string, newStatus: string) => {

  const resend = new Resend(process.env.RESEND_API_KEY!);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { postedBy: true },
  });


  if (!job || !job.postedBy) {
    console.error("Job or user not found for email notification.");
    return;
  }

  const { email, name } = job.postedBy;
  const jobUrl = `https://my-job-application.vercel.app/jobs/${job.id}`;
  const formattedDate = new Date(job.updatedAt).toLocaleDateString();


  const isPublished = newStatus === "PUBLISHED";
  const subject = isPublished
    ? "Your Job Post is Live Now!"
    : "Sorry, Your Job Post Was Rejected";

  try {
    await resend.emails.send({
      from: "Job Portal <onboarding@resend.dev>",
      to: email as string,
      subject,
      react: JobPostSuccessEmail({
        name: name as string,
        title: job.title,
        company: job.company,
        location: job.location,
        date: formattedDate,
        status: newStatus,
        jobUrl,
      }),
    });

    console.log(`Email sent successfully to ${email} for status ${newStatus}`);
    
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};






// import JobPostSuccessEmail from "@/app/emails/JobPostSuccessEmail";
// import { prisma } from "@/lib/prisma";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const EmailNotify = async (jobId: string, newStatus: string) => {

//     const job = await prisma.job.findFirst({
//         where: { id: jobId },
//         include: { postedBy: true }
//     });

//     const email = job?.postedBy.email;
//     const name = job?.postedBy.name;

//     const jobUrl = `https://myjobapplication.localhost:44317/jobs/${job?.id}`;
//     const formattedDate = new Date(job?.updatedAt as Date).toLocaleDateString();

//     if (newStatus == "PUBLISHED") {
//         await resend.emails.send({
//             from: "Job Portal <onboarding@resend.dev>",
//             to: email as string,
//             subject: "Your Job Post is Live Now!",
//             react: JobPostSuccessEmail({
//                 name: name as string,
//                 title: job?.title as string,
//                 company: job?.company as string,
//                 location: job?.location as string,
//                 date: formattedDate,
//                 jobUrl,
//             }),
//         });
//     } else {
//         await resend.emails.send({
//             from: "Job Portal <onboarding@resend.dev>",
//             to: email as string,
//             subject: "Sorry your Job Post is Rejected!",
//             react: JobPostSuccessEmail({
//                 name: name as string,
//                 title: job?.title as string,
//                 company: job?.company as string,
//                 location: job?.location as string,
//                 date: formattedDate,
//                 jobUrl,
//             }),
//         });
//     };

// };



// import nodemailer from "nodemailer";

// export const mailtrapTransporter = nodemailer.createTransport({
//   host: process.env.MAILTRAP_HOST,
//   port: Number(process.env.MAILTRAP_PORT),
//   auth: {
//     user: process.env.MAILTRAP_USER,
//     pass: process.env.MAILTRAP_PASS,
//   },
// });

// export async function sendAdminDecisionEmail(
//   email: string,
//   jobTitle: string,
//   decision: "approved" | "rejected"
// ) {
//   const subject =
//     decision === "approved"
//       ? "Your job has been published"
//       : "Your job was rejected";
//   const html =
//     decision === "approved"
//       ? `<p>Your job post "<b>${jobTitle}</b>" has been approved and published. <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs">View it</a>.</p>`
//       : `<p>We're sorry — your job post "<b>${jobTitle}</b>" was rejected. Please check guidelines and resubmit.</p>`;

//   await transporter.sendMail({
//     from: `"Jobs Team" <no-reply@${process.env.NEXT_PUBLIC_APP_URL?.replace(
//       /^https?:\/\//,
//       ""
//     )}>`,
//     to: email,
//     subject,
//     html,
//   });
// }