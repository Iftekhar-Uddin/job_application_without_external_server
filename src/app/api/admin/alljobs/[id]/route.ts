import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const job = await prisma.job.update({
            where: { id },
            data: { status: body.status },
        });
        return NextResponse.json(job);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
    }
}
