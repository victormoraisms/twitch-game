"use client"

import { useState, useEffect } from "react"
import { GameCard } from "@/components/game-card"
import { ScoreDisplay } from "@/components/score-display"
import { GameOverModal } from "@/components/game-over-modal"
import { StreamsModal } from "@/components/streams-modal"
import { PixModal } from "@/components/pix-modal"
import { getRandomGamePair } from "@/app/actions/getGames"

type Game = {
  id: string
  title: string
  viewers: number
  image: string
}

type InitialGamePair = {
  game1: {
    id: string
    name: string
    image: string
    viewers: number
  }
  game2: {
    id: string
    name: string
    image: string
    viewers: number
  }
}

interface GameClientProps {
  initialGamePair: InitialGamePair
}

// Transform Twitch API game to component Game type
const transformGame = (game: { id: string; name: string; image: string; viewers: number }): Game => ({
  id: game.id,
  title: game.name,
  viewers: game.viewers,
  image: game.image,
})

export function GameClient({ initialGamePair }: GameClientProps) {
  const [currentGame, setCurrentGame] = useState<Game | null>(() => transformGame(initialGamePair.game1))
  const [nextGame, setNextGame] = useState<Game | null>(() => transformGame(initialGamePair.game2))
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [usedGames, setUsedGames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamsModalOpen, setStreamsModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [pixModalOpen, setPixModalOpen] = useState(false)

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("higherLowerHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
    // Initialize used games with initial pair
    setUsedGames([initialGamePair.game1.id, initialGamePair.game2.id])
  }, [initialGamePair])

  const fetchNewGame = async (excludeIds: string[]): Promise<Game | null> => {
    try {
      setIsLoading(true)
      const gamePair = await getRandomGamePair()
      
      // Try to find a game that's not in the exclude list
      let selectedGame = transformGame(gamePair.game1)
      if (excludeIds.includes(selectedGame.id)) {
        selectedGame = transformGame(gamePair.game2)
        if (excludeIds.includes(selectedGame.id)) {
          // Both games are excluded, fetch another pair
          const anotherPair = await getRandomGamePair()
          selectedGame = transformGame(anotherPair.game1)
        }
      }
      
      return selectedGame
    } catch (error) {
      console.error("Error fetching new game:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuess = async (guess: "higher" | "lower") => {
    if (!currentGame || !nextGame || isLoading) return

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
      setTimeout(async () => {
        setCurrentGame(nextGame)
        const newNext = await fetchNewGame([...usedGames, nextGame.id])
        if (newNext) {
          setNextGame(newNext)
          setUsedGames([...usedGames, newNext.id])
        }
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

  const handleGameCardClick = (game: Game) => {
    setSelectedGame(game)
    setStreamsModalOpen(true)
  }

  const handlePlayAgain = async () => {
    setScore(0)
    setGameOver(false)
    setUsedGames([])
    setIsLoading(true)
    
    try {
      const gamePair = await getRandomGamePair()
      setCurrentGame(transformGame(gamePair.game1))
      setNextGame(transformGame(gamePair.game2))
      setUsedGames([gamePair.game1.id, gamePair.game2.id])
      setShowAnswer(false)
      setIsCorrect(null)
    } catch (error) {
      console.error("Error fetching games for new game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentGame || !nextGame || isLoading) {
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
          <GameCard
            game={currentGame}
            showViewers={true}
            position="left"
            onClick={() => handleGameCardClick(currentGame)}
          />

          <GameCard
            game={nextGame}
            showViewers={showAnswer}
            position="right"
            onGuess={handleGuess}
            isCorrect={isCorrect}
            disabled={showAnswer || isLoading}
            onClick={showAnswer ? () => handleGameCardClick(nextGame) : undefined}
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

        <div className="flex justify-center mt-8 md:mt-12">
          <button
            onClick={() => {
              setPixModalOpen(true)
              window.open("https://buymeacoffee.com/victormoraisms", "_blank", "noopener,noreferrer")
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#FFDD00] bg-[#FFDD00]/10 hover:bg-[#FFDD00]/20 text-foreground font-medium transition-all hover:scale-105 hover:shadow-lg"
          >
            <span className="text-xl">☕️</span>
            <span>Buy me a coffee</span>
          </button>
        </div>
      </div>

      <GameOverModal isOpen={gameOver} score={score} highScore={highScore} onPlayAgain={handlePlayAgain} />
      
      {selectedGame && (
        <StreamsModal
          isOpen={streamsModalOpen}
          onClose={() => {
            setStreamsModalOpen(false)
            setSelectedGame(null)
          }}
          gameId={selectedGame.id}
          gameName={selectedGame.title}
        />
      )}

      <PixModal
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
      />
    </div>
  )
}
