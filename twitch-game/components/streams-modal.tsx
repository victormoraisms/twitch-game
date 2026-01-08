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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {streams.map((stream) => (
              <Card key={stream.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={stream.thumbnail_url}
                    alt={`${stream.user_name} stream`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                      <Eye className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-white">
                        {formatViewers(stream.viewer_count)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate" title={stream.user_name}>
                    {stream.user_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2" title={stream.title}>
                    {stream.title}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
