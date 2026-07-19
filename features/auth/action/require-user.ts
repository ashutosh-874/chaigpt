"use server"

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/** Gets the current user's DB row. Requires onBoard() to have run first (see app/(root)/layout.tsx). */
export async function requireUser(){

    const { userId } = await auth.protect();

    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!user) {
      throw new Error("User not found. Complete onboarding first.");
    }
  
    return user;
}
