"use server"

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { onBoard } from "./onboard";

/**
 * Gets the current user's DB row, upserting it via onBoard() on first use.
 * Self-healing: a layout and its child page can render concurrently in Next.js,
 * so a page can't rely on the root layout's own onBoard() call having finished first.
 */
export async function requireUser(){

    const { userId } = await auth.protect();

    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    return user ?? onBoard();
}
