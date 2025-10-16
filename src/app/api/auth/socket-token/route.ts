import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const token = jwt.sign({ sub: session.user.id }, process.env.AUTH_SECRET!, { expiresIn: "1h" });
  return NextResponse.json({ token });
}

