import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, won, guesses } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "Game result not saved for guest user." }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        gamesPlayed: { increment: 1 },
        gamesWon: won ? { increment: 1 } : user.gamesWon,
        currentStreak: won ? { increment: 1 } : 0,
        maxStreak: won && user.currentStreak + 1 > user.maxStreak ? user.currentStreak + 1 : user.maxStreak,
      },
    });

    // Create a new game entry
    await prisma.game.create({
      data: {
        userId: user.id,
        guesses,
        won,
      },
    });

    return NextResponse.json({ message: "Game result saved successfully." });
  } catch (error) {
    console.error("Failed to save game result:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}