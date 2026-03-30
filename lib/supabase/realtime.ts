"use client"

import { createClient } from "@supabase/supabase-js"

const CHANNEL_NAME = "expense-updates"
const EVENT_NAME = "expense-changed"

let browserClient: ReturnType<typeof createClient> | null | undefined

function getSupabaseBrowserClient() {
  if (typeof window === "undefined") return null
  if (browserClient !== undefined) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const apiKey = publishableKey || anonKey

  if (!url || !apiKey) {
    browserClient = null
    return browserClient
  }

  browserClient = createClient(url, apiKey)
  return browserClient
}

export function subscribeToExpenseChanges(onChange: () => void) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return () => {}

  const channel = supabase.channel(CHANNEL_NAME, {
    config: { broadcast: { self: false } },
  })

  channel
    .on("broadcast", { event: EVENT_NAME }, () => {
      onChange()
    })
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

export async function broadcastExpenseChange(source: string) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return

  const channel = supabase.channel(CHANNEL_NAME, {
    config: { broadcast: { self: true } },
  })

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(() => resolve(), 1500)

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        window.clearTimeout(timeout)
        resolve()
      }
    })
  })

  await channel.send({
    type: "broadcast",
    event: EVENT_NAME,
    payload: {
      source,
      at: Date.now(),
    },
  })

  void supabase.removeChannel(channel)
}
