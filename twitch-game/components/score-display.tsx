interface ScoreDisplayProps {
  score: number
  highScore: number
}

export function ScoreDisplay({ score, highScore }: ScoreDisplayProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4 md:gap-8">
            <h1 className="text-2xl md:text-4xl font-bold neon-text text-foreground">Twitch - Higher or Lower!?</h1>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-right">
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Score</div>
              <div className="text-2xl md:text-4xl font-bold text-accent neon-text">{score}</div>
            </div>

            <div className="text-right">
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Best</div>
              <div className="text-2xl md:text-4xl font-bold text-primary">{highScore}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
