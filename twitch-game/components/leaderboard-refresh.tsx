"use client"

import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeaderboardRefresh() {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <Button
      onClick={handleRefresh}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-primary/10"
      title="Refresh leaderboard"
    >
      <RefreshCw className="w-4 h-4" />
    </Button>
  )
}
