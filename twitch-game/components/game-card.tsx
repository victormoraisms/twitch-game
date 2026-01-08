"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Eye } from "lucide-react"

type Game = {
  id: string | number
  title: string
  viewers: number
  image: string
}

interface GameCardProps {
  game: Game
  showViewers: boolean
  position: "left" | "right"
  onGuess?: (guess: "higher" | "lower") => void
  isCorrect?: boolean | null
  disabled?: boolean
  onClick?: () => void
}

export function GameCard({ game, showViewers, position, onGuess, isCorrect, disabled = false, onClick }: GameCardProps) {
  const formatViewers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <Card
      className={`relative overflow-hidden border-2 transition-all duration-300 ${
        isCorrect === true
          ? "border-green-500 neon-glow bg-green-950/20"
          : isCorrect === false
            ? "border-destructive bg-destructive/10"
            : "border-border hover:border-primary/50 bg-card"
      } ${showViewers && onClick ? "cursor-pointer" : ""}`}
      onClick={showViewers && onClick ? onClick : undefined}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={game.image || "/placeholder.svg"} alt={game.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-balance text-foreground drop-shadow-lg">
          {game.title}
        </h2>

        {showViewers ? (
          <div className="flex items-center gap-3 bg-secondary/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-border">
            <Eye className="w-6 h-6 md:w-8 md:h-8 text-accent" />
            <div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Viewers</div>
              <div className="text-2xl md:text-4xl font-bold text-accent neon-text">{formatViewers(game.viewers)}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-secondary/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-border mb-4">
              <Eye className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              <div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Viewers</div>
                <div className="text-2xl md:text-4xl font-bold text-muted-foreground">???</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onGuess?.("higher")
                }}
                disabled={disabled}
                size="lg"
                className="h-14 md:h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow transition-all"
              >
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Higher
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onGuess?.("lower")
                }}
                disabled={disabled}
                size="lg"
                variant="secondary"
                className="h-14 md:h-16 text-base md:text-lg font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground border-2 border-border hover:border-primary/50 transition-all"
              >
                <ArrowDown className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Lower
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
