"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface LiveDataSyncProps {
  intervalMs?: number
}

export function LiveDataSync({ intervalMs = 5000 }: LiveDataSyncProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, router])

  return null
}
