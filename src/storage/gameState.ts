import { createDefaultGameState } from "../types/GameState"

const GAME_STATE_KEY = "gameState"


export const getSavedGameState = () => {
    const savedGameState = localStorage.getItem(GAME_STATE_KEY)
    return savedGameState ? JSON.parse(savedGameState) : createDefaultGameState()
}

export const saveGameState = (gameState: unknown) => {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState))
}
