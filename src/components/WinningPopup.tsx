import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Confetti } from "@/components/Confetti"; // We will add this component next

interface WinningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  definition: string;
}

export function WinningPopup({ isOpen, onClose, word, definition }: WinningPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">
            You Won! 🎉
          </DialogTitle>
          <DialogDescription>
            <p className="mt-2 text-lg">The word was: <span className="font-semibold">{word}</span></p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {definition}
            </p>
          </DialogDescription>
        </DialogHeader>
        <Confetti />
      </DialogContent>
    </Dialog>
  );
}