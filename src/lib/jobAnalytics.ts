import { prisma } from "./prisma";

export async function getJobsAnalytics() {
  const totalJobs = await prisma.job.count();

  const jobsByType = await prisma.job.groupBy({
    by: ["type"],
    _count: { type: true },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7Days = await prisma.job.count({
    where: { postedAt: { gte: sevenDaysAgo } },
  });

  return {
    totalJobs,
    jobsByType,
    last7Days,
  };
}
