import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Dashboard from '@/components/Dashboard';


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
    <Dashboard postedJobs={postedJobs} applications={applications} />
  );

}

export default DashboardPage;