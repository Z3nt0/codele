import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        currentStreak: true,
        maxStreak: true,
        gamesPlayed: true,
        gamesWon: true,
      },
      orderBy: {
        maxStreak: "desc",
      },
      take: 100, // Limit to top 100 players
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard data." }, { status: 500 });
  }
}