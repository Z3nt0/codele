"use client";

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });

      myConfetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 }
      });
    }
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-50 pointer-events-none" />;
}