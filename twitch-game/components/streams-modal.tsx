"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { getTopStreams } from "@/app/actions/getGames"

type Stream = {
  id: string
  user_name: string
  user_login: string
  viewer_count: number
  thumbnail_url: string
  title: string
}

interface StreamsModalProps {
  isOpen: boolean
  onClose: () => void
  gameId: string
  gameName: string
}

export function StreamsModal({ isOpen, onClose, gameId, gameName }: StreamsModalProps) {
  const [streams, setStreams] = useState<Stream[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && gameId) {
      fetchStreams()
    } else {
      // Reset state when modal closes
      setStreams([])
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, gameId])

  const fetchStreams = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const topStreams = await getTopStreams(gameId)
      setStreams(topStreams)
    } catch (err) {
      setError("Failed to load streams. Please try again.")
      console.error("Error fetching streams:", err)
    } finally {
      setIsLoading(false)
    }
  }

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90vw] max-w-6xl h-[80vh] max-h-[80vh] overflow-y-auto"
        style={{ "--container-lg": "70rem" } as React.CSSProperties}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-4xl font-bold">
            Top Streams: {gameName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading streams...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-destructive">{error}</div>
          </div>
        ) : streams.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">No streams currently live for this game.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {streams.map((stream) => {
              const streamUrl = `https://www.twitch.tv/${stream.user_login}`
              
              return (
                <Card key={stream.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl flex flex-col">
                  <a
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video overflow-hidden bg-muted w-full block group"
                  >
                    <img
                      src={stream.thumbnail_url}
                      alt={`${stream.user_name} stream`}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </a>
                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <a
                        href={streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-2xl truncate flex-1 hover:text-primary transition-colors"
                        title={stream.user_name}
                      >
                        {stream.user_name}
                      </a>
                      <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-primary/20 flex-shrink-0 ml-2">
                        <Eye className="w-5 h-5 text-accent" />
                        <span className="text-lg font-bold text-accent">
                          {formatViewers(stream.viewer_count)}
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-muted-foreground line-clamp-2" title={stream.title}>
                      {stream.title}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
