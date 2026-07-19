"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/** Upserts the Clerk user into the local User table. Called from the root layout on every visit to keep profile fields fresh, and by requireUser() as a fallback on first use. */
export async function onBoard() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("Unauthorized")
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    return prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        create: {
            clerkId: clerkUser.id,
            email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl
        },
        update: {
            email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl
        }
    })
}
