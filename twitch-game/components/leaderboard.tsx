import { sql } from "@vercel/postgres"
import { LeaderboardRefresh } from "./leaderboard-refresh"

type LeaderboardEntry = {
  nickname: string
  score: number
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const result = await sql`
      SELECT nickname, score 
      FROM leaderboard 
      ORDER BY score DESC 
      LIMIT 10
    `
    return result.rows as LeaderboardEntry[]
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

export async function Leaderboard() {
  const entries = await getLeaderboard()

  const getRankColor = (rank: number) => {
    if (rank === 1) return "border-yellow-500 text-yellow-500 bg-yellow-500/10"
    if (rank === 2) return "border-gray-400 text-gray-400 bg-gray-400/10"
    if (rank === 3) return "border-amber-600 text-amber-600 bg-amber-600/10"
    return "border-border text-muted-foreground"
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  return (
    <div className="w-full bg-card border-2 border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
        <LeaderboardRefresh />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No scores yet. Be the first!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const rank = index + 1
            const colorClass = getRankColor(rank)
            const icon = getRankIcon(rank)

            return (
              <div
                key={`${entry.nickname}-${entry.score}-${index}`}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${colorClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 font-bold">
                    {icon || rank}
                  </div>
                  <span className="font-semibold truncate max-w-[150px]">{entry.nickname}</span>
                </div>
                <div className="font-bold text-lg">{entry.score}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
