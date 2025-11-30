import type { PresentationData } from "./store"


class HistoryManager {
  private past: PresentationData[] = []
  private present: PresentationData | null = null
  private future: PresentationData[] = []
  private readonly maxSize = 50

  saveState(state: PresentationData) {
    if (this.present) {
      this.past.push(this.present)
      if (this.past.length > this.maxSize) {
        this.past.shift()
      }
    }
    this.present = state
    this.future = []
  }

  undo(): PresentationData | null {
    if (this.past.length === 0) return null
    
    const previous = this.past.pop()!
    this.future.unshift(this.present!)
    this.present = previous
    
    return previous
  }

  redo(): PresentationData | null {
    if (this.future.length === 0) return null
    
    const next = this.future.shift()!
    this.past.push(this.present!)
    this.present = next
    
    return next
  }

  canUndo(): boolean {
    return this.past.length > 0
  }

  canRedo(): boolean {
    return this.future.length > 0
  }

  clear() {
    this.past = []
    this.present = null
    this.future = []
  }
}

export const historyManager = new HistoryManager()