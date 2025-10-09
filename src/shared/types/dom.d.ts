// Declarações de tipos globais para DOM APIs
declare global {
  const setTimeout: (callback: () => void, delay: number) => number
  const clearTimeout: (id: number) => void
  const window: Window & typeof globalThis
  
  interface Window {
    setTimeout: (callback: () => void, delay: number) => number
    clearTimeout: (id: number) => void
    innerWidth: number
    innerHeight: number
  }
}

export {}