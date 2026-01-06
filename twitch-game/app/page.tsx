"use client"

import { useState, useEffect } from "react"
import { GameCard } from "@/components/game-card"
import { ScoreDisplay } from "@/components/score-display"
import { GameOverModal } from "@/components/game-over-modal"

type Game = {
  id: number
  title: string
  viewers: number
  image: string
}

const GAME_DATA: Game[] = [
  { id: 1, title: "League of Legends", viewers: 145000, image: "/league-of-legends-game.jpg" },
  { id: 2, title: "Valorant", viewers: 98000, image: "/valorant-game.jpg" },
  { id: 3, title: "Fortnite", viewers: 87000, image: "/generic-battle-royale.png" },
  { id: 4, title: "Counter-Strike 2", viewers: 125000, image: "/tactical-shooter-scene.png" },
  { id: 5, title: "Minecraft", viewers: 76000, image: "/minecraft-game.png" },
  { id: 6, title: "Grand Theft Auto V", viewers: 62000, image: "/gta-v-game.jpg" },
  { id: 7, title: "Dota 2", viewers: 54000, image: "/dota-2-gameplay.png" },
  { id: 8, title: "Apex Legends", viewers: 48000, image: "/futuristic-battle-arena.png" },
  { id: 9, title: "World of Warcraft", viewers: 39000, image: "/world-of-warcraft-game.jpg" },
  { id: 10, title: "Overwatch 2", viewers: 34000, image: "/overwatch-2-game.jpg" },
  { id: 11, title: "Dead by Daylight", viewers: 28000, image: "/dead-by-daylight-game.jpg" },
  { id: 12, title: "Rocket League", viewers: 25000, image: "/rocket-league-game.jpg" },
  { id: 13, title: "Elden Ring", viewers: 22000, image: "/elden-ring-inspired-landscape.png" },
  { id: 14, title: "Call of Duty", viewers: 67000, image: "/call-of-duty-game.jpg" },
  { id: 15, title: "Rust", viewers: 31000, image: "/rust-survival.png" },
]

export default function HigherOrLowerGame() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [nextGame, setNextGame] = useState<Game | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [usedGames, setUsedGames] = useState<number[]>([])

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("higherLowerHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Initialize game
  useEffect(() => {
    if (!currentGame || !nextGame) {
      initializeGame()
    }
  }, [])

  const initializeGame = () => {
    const shuffled = [...GAME_DATA].sort(() => Math.random() - 0.5)
    setCurrentGame(shuffled[0])
    setNextGame(shuffled[1])
    setUsedGames([shuffled[0].id, shuffled[1].id])
    setShowAnswer(false)
    setIsCorrect(null)
  }

  const getRandomGame = (exclude: number[]) => {
    const available = GAME_DATA.filter((game) => !exclude.includes(game.id))
    if (available.length === 0) {
      // Reset if we've used all games
      const shuffled = [...GAME_DATA].sort(() => Math.random() - 0.5)
      setUsedGames([])
      return shuffled[0]
    }
    return available[Math.floor(Math.random() * available.length)]
  }

  const handleGuess = (guess: "higher" | "lower") => {
    if (!currentGame || !nextGame) return

    const correct =
      (guess === "higher" && nextGame.viewers >= currentGame.viewers) ||
      (guess === "lower" && nextGame.viewers <= currentGame.viewers)

    setIsCorrect(correct)
    setShowAnswer(true)

    if (correct) {
      const newScore = score + 1
      setScore(newScore)

      if (newScore > highScore) {
        setHighScore(newScore)
        localStorage.setItem("higherLowerHighScore", newScore.toString())
      }

      // Move to next round after delay
      setTimeout(() => {
        setCurrentGame(nextGame)
        const newNext = getRandomGame([...usedGames, nextGame.id])
        setNextGame(newNext)
        setUsedGames([...usedGames, newNext.id])
        setShowAnswer(false)
        setIsCorrect(null)
      }, 1500)
    } else {
      // Game over
      setTimeout(() => {
        setGameOver(true)
      }, 1500)
    }
  }

  const handlePlayAgain = () => {
    setScore(0)
    setGameOver(false)
    setUsedGames([])
    initializeGame()
  }

  if (!currentGame || !nextGame) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-bold neon-text text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScoreDisplay score={score} highScore={highScore} />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-7xl mx-auto">
          <GameCard game={currentGame} showViewers={true} position="left" />

          <GameCard
            game={nextGame}
            showViewers={showAnswer}
            position="right"
            onGuess={handleGuess}
            isCorrect={isCorrect}
            disabled={showAnswer}
          />
        </div>

        {showAnswer && isCorrect !== null && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`text-6xl md:text-8xl font-bold animate-pulse ${
                isCorrect ? "text-green-500" : "text-destructive"
              }`}
            >
              {isCorrect ? "✓" : "✗"}
            </div>
          </div>
        )}
      </div>

      <GameOverModal isOpen={gameOver} score={score} highScore={highScore} onPlayAgain={handlePlayAgain} />
    </div>
  )
}
