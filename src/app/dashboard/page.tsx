import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import DashboardIntegrated from '@/components/Dashboard';

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin")
  };

  const [postedJobs, applications] = await Promise.all([
    prisma.job.findMany({
      where: {
        postedById: session?.user?.id
      },
      include: {
        _count: {
          select: {
            applications: true,
          }
        }
      },
      orderBy: {
        postedAt: "desc"
      },
    }),

    prisma.application.findMany({
      where: {
        userId: session?.user?.id
      },
      include: {
        job: {
          include: {
            postedBy: true,
          }
        }
      },
      orderBy: {
        appliedAt: "desc"
      },
    }),

  ]);

  return (
    <DashboardIntegrated applications={applications as any} postedJobs={postedJobs as any} />
  );

}

export default DashboardPage;