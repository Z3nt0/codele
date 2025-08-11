"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DictionaryPopupProps {
  word: string;
  definition: string;
}

export function DictionaryPopup({ word, definition }: DictionaryPopupProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show Definition</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{word}</DialogTitle>
          <DialogDescription>
            <p>{definition}</p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}