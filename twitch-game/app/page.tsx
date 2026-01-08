import { getRandomGamePair } from "@/app/actions/getGames"
import { GameClient } from "@/components/game-client"
import { Leaderboard } from "@/components/leaderboard"

export const revalidate = 60

export default async function HigherOrLowerGame() {
  // Fetch initial game pair from Twitch API on the server
  const initialGamePair = await getRandomGamePair()

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="flex-1">
        <GameClient initialGamePair={initialGamePair} />
      </div>
      <aside className="w-full lg:w-80 flex-shrink-0">
        <Leaderboard />
      </aside>
    </div>
  )
}
