"use client"

import { useState, FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"
import { saveHighScore } from "@/app/actions/leaderboard"

interface GameOverModalProps {
  isOpen: boolean
  score: number
  highScore: number
  onPlayAgain: () => void
}

export function GameOverModal({ isOpen, score, highScore, onPlayAgain }: GameOverModalProps) {
  const [nickname, setNickname] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isNewHighScore = score === highScore && score > 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nickname.trim() || isSubmitting || isSubmitted) return

    setIsSubmitting(true)
    try {
      await saveHighScore(nickname.trim(), score)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error saving high score:", error)
      // Still allow play again even if save fails
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlayAgain = () => {
    setNickname("")
    setIsSubmitted(false)
    onPlayAgain()
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary bg-card" showCloseButton={false}>
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

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-foreground mb-2">
                  Enter your nickname for the leaderboard:
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  maxLength={50}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !nickname.trim()}
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Score"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-green-500 font-semibold">
                ✓ Score saved to leaderboard!
              </div>
              <Button
                onClick={handlePlayAgain}
                size="lg"
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
