"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  email: string;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data.");
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Global Leaderboard</h1>
      {error && <p className="text-red-500">Error: {error}</p>}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Max Streak</TableHead>
              <TableHead className="text-right">Games Won</TableHead>
              <TableHead className="text-right">Games Played</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((user, index) => (
              <TableRow key={user.email}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">{user.maxStreak}</TableCell>
                <TableCell className="text-right">{user.gamesWon}</TableCell>
                <TableCell className="text-right">{user.gamesPlayed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}