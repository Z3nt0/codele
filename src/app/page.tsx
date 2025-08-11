"use client";

import { useState, useEffect } from "react";
import { Keyboard } from "@/components/Keyboard";
import { motion } from "framer-motion";
import { WinningPopup } from "@/components/WinningPopup";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

// Type definition for the word of the day data
interface WordData {
  word: string;
  definition: string;
}

export default function HomePage() {
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(""));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  const mockUserId = 1;

useEffect(() => {
    const fetchDailyWord = async () => {
      setIsLoading(true);
      try {
        const wordResponse = await fetch("/api/word-of-day");
        const wordResult = await wordResponse.json();
        
        // ✅ FIX: Check if wordResult.word exists before using it
        if (!wordResult || !wordResult.word) {
            console.error("API response did not contain a valid word.");
            return;
        }

        const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordResult.word}`);
        const definitionData = await definitionResponse.json();
        const definition = definitionData[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found.";

        setWordData({ word: wordResult.word.toUpperCase(), definition });
      } catch (error) {
        console.error("Failed to fetch daily word:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDailyWord();
  }, []);

  const saveGameResult = async (won: boolean) => {
    if (!mockUserId) {
      console.log("Game results not saved for guest player.");
      return;
    }
    
    try {
      const response = await fetch("/api/game-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: mockUserId,
          won,
          guesses: currentGuessIndex + 1,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save game result.");
      }
      console.log("Game result saved successfully.");
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  useEffect(() => {
    if (gameStatus === "won") {
      saveGameResult(true);
      if (wordData) {
        setShowPopup(true);
      }
    } else if (gameStatus === "lost") {
      saveGameResult(false);
    }
  }, [gameStatus, wordData]);

  const handleKeyClick = (key: string) => {
    if (gameStatus !== "playing" || !wordData) return;

    if (key === "ENTER") {
      if (guesses[currentGuessIndex].length === WORD_LENGTH) {
        if (guesses[currentGuessIndex].toUpperCase() === wordData.word) {
          setGameStatus("won");
        } else if (currentGuessIndex + 1 === MAX_GUESSES) {
          setGameStatus("lost");
        }
        setCurrentGuessIndex((prev) => prev + 1);
      }
    } else if (key === "DEL") {
      setGuesses((prev) => {
        const newGuesses = [...prev];
        newGuesses[currentGuessIndex] = newGuesses[currentGuessIndex].slice(0, -1);
        return newGuesses;
      });
    } else if (key.length === 1 && guesses[currentGuessIndex].length < WORD_LENGTH) {
      setGuesses((prev) => {
        const newGuesses = [...prev];
        newGuesses[currentGuessIndex] += key.toUpperCase();
        return newGuesses;
      });
    }
  };

  const getTileStatus = (letter: string, index: number) => {
    if (!wordData) return "";
    const dailyWordLetters = wordData.word.split("");
    const isCorrect = letter === dailyWordLetters[index];
    const isInWord = dailyWordLetters.includes(letter);

    if (isCorrect) return "bg-green-500 text-white";
    if (isInWord) return "bg-yellow-500 text-white";
    return "bg-gray-300 dark:bg-gray-700";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg">Loading word...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-4 sm:p-8 max-w-sm mx-auto">
      
      {/* Game Board Grid */}
      <div className="grid grid-cols-5 gap-2 my-1">
        {guesses.map((guess, rowIndex) =>
          Array.from({ length: WORD_LENGTH }).map((_, letterIndex) => {
            const letter = guess[letterIndex] || "";
            const tileStatus =
              rowIndex < currentGuessIndex || gameStatus !== "playing"
                ? getTileStatus(letter, letterIndex)
                : "bg-white dark:bg-black border-2 border-gray-400";

            return (
              <motion.div
                key={`${rowIndex}-${letterIndex}`}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase rounded ${tileStatus}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: letterIndex * 0.05 }}
              >
                {letter}
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mt-1 w-full max-w-md">
        <Keyboard onKeyClick={handleKeyClick} />
      </div>

      {gameStatus !== "playing" && (
        <div className="mt-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold">
            {gameStatus === "won" ? "You Won! 🎉" : "You Lost! 😞"}
          </h2>
          {gameStatus === "lost" && wordData && (
            <>
              <p className="text-lg">The word was: {wordData.word}</p>
              <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">{wordData.definition}</p>
            </>
          )}
        </div>
      )}

      {wordData && (
        <WinningPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          word={wordData.word}
          definition={wordData.definition}
        />
      )}
    </div>
  );
}