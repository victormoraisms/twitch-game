"use server"

type TwitchGame = {
  id: string
  name: string
  box_art_url: string
}

type TwitchStream = {
  game_id: string
  viewer_count: number
}

type TwitchStreamDetail = {
  id: string
  user_name: string
  user_login: string
  viewer_count: number
  thumbnail_url: string
  title: string
}

type TwitchTopGame = {
  id: string
  name: string
  box_art_url: string
  viewers: number
}

type GamePair = {
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

/**
 * Get an OAuth access token from Twitch API
 */
async function getTwitchAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Twitch API credentials are not configured. Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.")
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Twitch access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Fetch streams and aggregate viewer counts by game
 */
async function getGameViewerCounts(accessToken: string, clientId: string): Promise<Map<string, number>> {
  const gameViewerCounts = new Map<string, number>()
  let cursor: string | null = null
  const maxRequests = 10 // Limit to 10 requests (1000 streams max) to avoid rate limits
  let requestCount = 0

  do {
    const url = new URL("https://api.twitch.tv/helix/streams")
    url.searchParams.append("first", "100") // Max per request
    if (cursor) {
      url.searchParams.append("after", cursor)
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch streams from Twitch: ${error}`)
    }

    const data = await response.json()
    
    if (data.data && Array.isArray(data.data)) {
      for (const stream of data.data as TwitchStream[]) {
        if (stream.game_id) {
          const currentCount = gameViewerCounts.get(stream.game_id) || 0
          gameViewerCounts.set(stream.game_id, currentCount + stream.viewer_count)
        }
      }
    }

    cursor = data.pagination?.cursor || null
    requestCount++
  } while (cursor && requestCount < maxRequests)

  return gameViewerCounts
}

/**
 * Fetch game details for given game IDs
 */
async function getGameDetails(accessToken: string, clientId: string, gameIds: string[]): Promise<Map<string, TwitchGame>> {
  const gameMap = new Map<string, TwitchGame>()
  
  // Twitch API allows up to 100 game IDs per request
  for (let i = 0; i < gameIds.length; i += 100) {
    const batch = gameIds.slice(i, i + 100)
    const url = new URL("https://api.twitch.tv/helix/games")
    batch.forEach(id => url.searchParams.append("id", id))

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch game details from Twitch: ${error}`)
    }

    const data = await response.json()
    if (data.data && Array.isArray(data.data)) {
      for (const game of data.data as TwitchGame[]) {
        gameMap.set(game.id, game)
      }
    }
  }

  return gameMap
}

/**
 * Fetch the top 100 most-watched games from Twitch
 */
async function getTopGames(accessToken: string, clientId: string): Promise<TwitchTopGame[]> {
  // First, get viewer counts by aggregating streams
  const gameViewerCounts = await getGameViewerCounts(accessToken, clientId)
  
  // Sort games by viewer count and get top 100 game IDs
  const sortedGameIds = Array.from(gameViewerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([gameId]) => gameId)

  if (sortedGameIds.length === 0) {
    throw new Error("No games with viewers found")
  }

  // Get game details for the top games
  const gameDetails = await getGameDetails(accessToken, clientId, sortedGameIds)

  // Combine game details with viewer counts
  const topGames: TwitchTopGame[] = sortedGameIds
    .map(gameId => {
      const game = gameDetails.get(gameId)
      const viewers = gameViewerCounts.get(gameId) || 0
      if (!game) return null
      return {
        id: game.id,
        name: game.name,
        box_art_url: game.box_art_url,
        viewers,
      }
    })
    .filter((game): game is TwitchTopGame => game !== null)

  return topGames
}

/**
 * Server Action: Fetch top 3 streams for a specific game
 */
export async function getTopStreams(gameId: string): Promise<TwitchStreamDetail[]> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID
    if (!clientId) {
      throw new Error("TWITCH_CLIENT_ID is not configured")
    }

    // Get access token
    const accessToken = await getTwitchAccessToken()

    // Fetch top 3 streams for the game
    const url = new URL("https://api.twitch.tv/helix/streams")
    url.searchParams.append("game_id", gameId)
    url.searchParams.append("first", "3")

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch streams from Twitch: ${error}`)
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      return []
    }

    // Transform and format thumbnail URLs
    return data.data.map((stream: any) => ({
      id: stream.id,
      user_name: stream.user_name,
      user_login: stream.user_login,
      viewer_count: stream.viewer_count,
      thumbnail_url: stream.thumbnail_url
        .replace("{width}", "400")
        .replace("{height}", "225"),
      title: stream.title,
    }))
  } catch (error) {
    console.error("Error fetching top streams:", error)
    throw error
  }
}

/**
 * Server Action: Fetch top 100 games from Twitch and return two randomly selected games
 */
export async function getRandomGamePair(): Promise<GamePair> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID
    if (!clientId) {
      throw new Error("TWITCH_CLIENT_ID is not configured")
    }

    // Get access token
    const accessToken = await getTwitchAccessToken()

    // Fetch top 100 games
    const topGames = await getTopGames(accessToken, clientId)

    if (topGames.length < 2) {
      throw new Error("Not enough games returned from Twitch API")
    }

    // Randomly select two different games
    const randomIndex1 = Math.floor(Math.random() * topGames.length)
    let randomIndex2 = Math.floor(Math.random() * topGames.length)
    
    // Ensure we get two different games
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * topGames.length)
    }

    const game1 = topGames[randomIndex1]
    const game2 = topGames[randomIndex2]

    // Format box art URL (replace {width}x{height} with actual dimensions)
    const formatBoxArtUrl = (url: string) => {
      return url.replace("{width}", "272").replace("{height}", "380")
    }

    return {
      game1: {
        id: game1.id,
        name: game1.name,
        image: formatBoxArtUrl(game1.box_art_url),
        viewers: game1.viewers,
      },
      game2: {
        id: game2.id,
        name: game2.name,
        image: formatBoxArtUrl(game2.box_art_url),
        viewers: game2.viewers,
      },
    }
  } catch (error) {
    console.error("Error fetching games from Twitch:", error)
    throw error
  }
}
