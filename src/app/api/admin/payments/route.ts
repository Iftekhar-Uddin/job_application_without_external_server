import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');

  const payments = await prisma.payment.findMany({
    include: { job: { select: { title: true, company: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const csv = [
      'PaymentID,Provider,Status,JobTitle,Company,CreatedAt',
      ...payments.map(p =>
        [p.id, p.provider, p.status, p.job?.title ?? '', p.job?.company ?? '', p.createdAt.toISOString()].join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=payments.csv',
      },
    });
    
  }

  return NextResponse.json({ payments });
}
