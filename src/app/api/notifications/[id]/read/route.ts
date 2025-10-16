import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const SOCKET_URL = process.env.SOCKET_URL!;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY!;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  if (!id) return NextResponse.json({ message: "Missing notification id" }, { status: 400 });

  try {
    const result = await prisma.notification.updateMany({
      where: { id, receiverId: userId },
      data: { isRead: true },
    });

    // Notify realtime server to broadcast to other sessions/tabs
    try {
      await fetch(`https://job-app-socket-server.onrender.com/v1/notify-read`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-key":INTERNAL_API_KEY,
        },
        body: JSON.stringify({ userId, ids: [id] }),
      });
    } catch (e) {
      console.warn("notify-read failed:", e);
    }

    return NextResponse.json({ ok: true, updated: result.count });
  } catch (error: any) {
    console.error("Error marking read:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
