import { getCurrentInstance, onBeforeUnmount } from 'vue'
import type { AppEventPayloads, AppEventName } from '~/types/events'

type Callback<T> = (payload: T) => void
type Listeners = Map<string, Set<Callback<any>>>

// Module-level singleton — one emitter for the entire app lifecycle.
// Not stored in Pinia: events don't need reactivity, only delivery.
const listeners: Listeners = new Map()

function _emit<K extends AppEventName>(event: K, payload: AppEventPayloads[K]): void {
  listeners.get(event)?.forEach((fn) => fn(payload))
}

function _on<K extends AppEventName>(event: K, callback: Callback<AppEventPayloads[K]>): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(callback)
  return () => listeners.get(event)?.delete(callback)
}

// ---------------------------------------------------------------------------
// Public composable
// ---------------------------------------------------------------------------
export function useAppEvents() {
  function emit<K extends AppEventName>(event: K, payload: AppEventPayloads[K]): void {
    _emit(event, payload)
  }

  function on<K extends AppEventName>(
    event: K,
    callback: Callback<AppEventPayloads[K]>,
  ): () => void {
    const cleanup = _on(event, callback)
    // Auto-cleanup when the calling component unmounts
    if (getCurrentInstance()) {
      onBeforeUnmount(cleanup)
    }
    return cleanup
  }

  return { emit, on }
}
