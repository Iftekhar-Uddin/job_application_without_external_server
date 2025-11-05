import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { profileSchema } from "@/schemas";

export async function PUT(req: Request) {

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = profileSchema.safeParse(body);

    if (!validated.success) {
      const errorMessage = validated.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const updateData = validated.data;
    
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      education: updatedUser.education,
      skills: updatedUser.skills || [],
      experience: updatedUser.experience,
      previousInstitution: updatedUser.previousInstitution,
      address: updatedUser.address,
      role: updatedUser.role,
    };

    return NextResponse.json(safeUser);
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}





