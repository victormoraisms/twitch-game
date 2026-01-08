"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"

export async function saveHighScore(nickname: string, score: number) {
  try {
    // Insert the high score into the leaderboard table
    await sql`
      INSERT INTO leaderboard (nickname, score, created_at)
      VALUES (${nickname}, ${score}, NOW())
    `
    
    // Revalidate the path to refresh the leaderboard data
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    console.error("Error saving high score:", error)
    throw new Error("Failed to save high score")
  }
}
