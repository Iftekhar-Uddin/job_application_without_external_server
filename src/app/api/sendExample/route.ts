import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path to your Prisma client
import { auth } from "@/auth"; // import from where you export `auth` in your NextAuth config

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, title, body } = await req.json();

    if (!receiverId || !title || !body) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        receiverId,
        senderId: session.user.id,
        title,
        body,
      },
    });

    // Emit real-time update via your Socket.IO server helper
    const emit = (global as any).__emitNotificationToUser;
    if (typeof emit === "function") {
      await emit(receiverId, notification);
    }

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error: any) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
