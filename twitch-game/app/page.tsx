import { getRandomGamePair } from "@/app/actions/getGames"
import { GameClient } from "@/components/game-client"

export default async function HigherOrLowerGame() {
  // Fetch initial game pair from Twitch API on the server
  const initialGamePair = await getRandomGamePair()

  return <GameClient initialGamePair={initialGamePair} />
}
