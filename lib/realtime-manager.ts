"use client"

import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SubscriptionConfig {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  callback: (payload: any) => void
}

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, SubscriptionConfig> = new Map()

  subscribe(id: string, config: SubscriptionConfig): () => void {
    // Clean up existing subscription with same ID
    this.unsubscribe(id)

    const channelName = `${config.table}-${id}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: 'public',
          table: config.table,
          ...(config.filter && { filter: config.filter })
        },
        (payload) => {
          console.log(`Realtime update for ${config.table}:`, payload)
          config.callback(payload)
        }
      )
      .subscribe((status) => {
        console.log(`Subscription ${id} status:`, status)
      })

    this.channels.set(id, channel)
    this.subscriptions.set(id, config)

    // Return cleanup function
    return () => this.unsubscribe(id)
  }

  unsubscribe(id: string): void {
    const channel = this.channels.get(id)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(id)
      this.subscriptions.delete(id)
      console.log(`Unsubscribed from ${id}`)
    }
  }

  unsubscribeAll(): void {
    for (const [id] of this.channels) {
      this.unsubscribe(id)
    }
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.channels.keys())
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeManager.unsubscribeAll()
  })
}

// Hook for easy usage in React components
export function useRealtimeSubscription(
  id: string,
  config: SubscriptionConfig,
  dependencies: any[] = []
) {
  const { useEffect } = require('react')
  
  useEffect(() => {
    const cleanup = realtimeManager.subscribe(id, config)
    return cleanup
  }, dependencies)
}