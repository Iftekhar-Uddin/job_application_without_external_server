import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: any = {};
  if (search) where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { company: { contains: search, mode: 'insensitive' } },
  ];
  if (status) where.status = status;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { payments: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { postedAt: 'desc' },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, total });
}
