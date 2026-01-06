"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"

interface GameOverModalProps {
  isOpen: boolean
  score: number
  highScore: number
  onPlayAgain: () => void
}

export function GameOverModal({ isOpen, score, highScore, onPlayAgain }: GameOverModalProps) {
  const isNewHighScore = score === highScore && score > 0

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary bg-card">
        <DialogHeader>
          <DialogTitle className="text-3xl md:text-4xl font-bold text-center neon-text text-foreground">
            Game Over!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            {isNewHighScore ? "🎉 New High Score! 🎉" : "Better luck next time!"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Your Score</div>
              <div className="text-5xl font-bold text-accent neon-text">{score}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                Best Score
              </div>
              <div className="text-5xl font-bold text-primary">{highScore}</div>
            </div>
          </div>

          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
