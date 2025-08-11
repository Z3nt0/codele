// /app/api/word-of-day/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { InferenceClient } from "@huggingface/inference";

const huggingFaceApiToken = process.env.HF_TOKEN;

if (!huggingFaceApiToken) {
  throw new Error("HF_TOKEN is not set in environment variables.");
}

const client = new InferenceClient(huggingFaceApiToken);

async function getITWordFromHuggingFace(): Promise<string | null> {
  const prompt = "Please choose and output ONLY one 5-letter word in uppercase letters related to programming, networking, internet, or IT. Do not output anything else besides the word.c";

  try {
    const completion = await client.chatCompletion({
      // ✅ FIX: Using the provider and model from your example
      provider: "featherless-ai",
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      parameters: { max_new_tokens: 10, temperature: 0.7 },
    });

    const generatedText = completion.choices[0]?.message?.content;
    
    console.log("Raw text from Hugging Face:", generatedText);

    if (!generatedText) {
      console.error("Hugging Face API returned no content.");
      return null;
    }

    const words = generatedText.split(/[\s,.'";:\n]+/)
      .map(word => word.trim().toUpperCase())
      .filter(word => word.length === 5 && /^[A-Z]+$/.test(word));

    console.log("Parsed and filtered words:", words);

    if (words.length > 0) {
      console.log("Final word chosen:", words[0]);
      return words[0];
    }

    console.warn("No 5-letter IT word was found in the API response.");

  } catch (error) {
    console.error("Hugging Face API call failed:", error);
  }
  return null;
}

export async function GET() {
  try {
    const now = new Date();
    now.setSeconds(0, 0); 
    const testDate = now;

    const existingWord = await prisma.wordOfDay.findFirst({
      where: {
        date: testDate,
      },
    });

    if (existingWord) {
      return NextResponse.json(existingWord);
    }
    
    const newWord = await getITWordFromHuggingFace();

    if (!newWord) {
      throw new Error("Failed to generate a valid word from Hugging Face API. Check logs for details.");
    }

    const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${newWord}`);
    const definitionData = await definitionResponse.json();
    const definition = definitionData[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found.";

    const wordOfDay = await prisma.wordOfDay.create({
      data: {
        word: newWord,
        date: testDate,
        source: "Hugging Face / Dictionary API",
      },
    });
    
    const responseWithDefinition = { ...wordOfDay, definition };

    return NextResponse.json(responseWithDefinition);
  } catch (error) {
    console.error("Word generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}