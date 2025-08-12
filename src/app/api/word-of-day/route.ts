// /app/api/word-of-day/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

// ✅ FIX: This function calculates the start of the current day in Manila Time
const getManilaMidnight = (): Date => {
  const now = new Date();
  const manilaOffset = 8 * 60; // Manila is UTC+8
  const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
  
  const manilaTime = new Date(now.getTime() + (manilaOffset + localOffset) * 60 * 1000);
  
  manilaTime.setHours(0, 0, 0, 0);
  return manilaTime;
};

async function getITWordFromOpenAI(): Promise<string | null> {
  const prompt = `Choose exactly ONE 5-letter English word in UPPERCASE 
that is related to programming, networking, internet, or IT. 
Do not include punctuation, numbers, or extra words. Output only the word.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 10,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content?.trim();
    console.log("Raw text from OpenAI:", generatedText);

    if (!generatedText) return null;

    const words = generatedText
      .split(/[\s,.'";:\n]+/)
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length === 5 && /^[A-Z]+$/.test(w));

    return words.length > 0 ? words[0] : null;
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    return null;
  }
}

export async function GET() {
  try {
    // ✅ FIX: Use the Manila midnight time for the daily check
    const manilaMidnight = getManilaMidnight();

    // ✅ Check if today's word is already saved
    const existingWord = await prisma.wordOfDay.findFirst({
      where: { date: manilaMidnight },
    });
    if (existingWord) return NextResponse.json(existingWord);

    // ✅ Generate new word
    const newWord = await getITWordFromOpenAI();
    if (!newWord) throw new Error("Failed to generate a valid word from OpenAI API.");

    // ✅ Get definition
    const definitionResponse = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${newWord}`
    );
    const definitionData = await definitionResponse.json();
    const definition =
      definitionData[0]?.meanings[0]?.definitions[0]?.definition ||
      "Definition not found.";

    // ✅ Save to DB
    const wordOfDay = await prisma.wordOfDay.create({
      data: {
        word: newWord,
        date: manilaMidnight, // ✅ FIX: Save with Manila midnight time
        source: "OpenAI / Dictionary API",
      },
    });

    return NextResponse.json({ ...wordOfDay, definition });
  } catch (error) {
    console.error("Word generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}