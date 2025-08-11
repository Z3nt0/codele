"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface KeyboardProps {
  onKeyClick: (key: string) => void;
}

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

// Button animation variants
const keyVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.9, transition: { duration: 0.05 } },
  hover: { scale: 1.05, transition: { duration: 0.1 } },
};

export function Keyboard({ onKeyClick }: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-[2px] sm:gap-1 w-full">
      {keyboardLayout.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="flex gap-[2px] sm:gap-1 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: rowIndex * 0.05,
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          {row.map((key, keyIndex) => (
            <motion.div
              key={keyIndex}
              variants={keyVariants}
              whileHover="hover"
              whileTap="tap"
              className="flex-1 min-w-[30px]"
            >
              <Button
                onClick={() => onKeyClick(key)}
                className={`h-12 sm:h-14 w-full px-1 sm:px-3 uppercase font-bold text-xs sm:text-sm tracking-wide rounded-md
                  ${key === "ENTER" || key === "DEL" ? "flex-1.5 min-w-[50px] sm:min-w-[60px]" : ""}
                `}
                variant="secondary"
              >
                {key}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
