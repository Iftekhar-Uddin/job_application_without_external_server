import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const SOCKET_URL = process.env.SOCKET_URL!;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY!;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { receiverId: session.user.id },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({ data: notifications });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { receiverId, title, body: messageBody, data } = body;

  if (!receiverId || !title || !messageBody) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        receiverId,
        senderId: session.user.id,
        title,
        body: messageBody,
        data: data ?? null,
      },
    });

    // best practice: DB persisted first, then call realtime server
    try {
      await fetch(`https://job-app-socket-server.onrender.com/v1/notify`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-key": INTERNAL_API_KEY,
        },
        body: JSON.stringify({
          receiverId,
          payload: {
            id: notification.id,
            receiverId: notification.receiverId,
            senderId: notification.senderId,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
          },
        }),
      });
    } catch (e) {
      console.warn("Realtime notify failed, notification persisted:", e);
    }

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json({ message: error.message || "Internal error" }, { status: 500 });
  }
}
